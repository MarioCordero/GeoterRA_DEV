import React, { useState, useCallback } from "react";
import { Form, Input, Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "../../colorModule.css";
import '../../fontsModule.css';

const { Option } = Select;

// Country data with validation patterns
const countries = [
  {
    code: "CR",
    name: "Costa Rica",
    dialCode: "+506",
    flag: "🇨🇷",
    pattern: /^[0-9]{8}$/,
    placeholder: "8888 8888",
    minLength: 8,
    maxLength: 8
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    pattern: /^[0-9]{10}$/,
    placeholder: "(555) 123-4567",
    minLength: 10,
    maxLength: 10
  },
  {
    code: "MX",
    name: "Mexico",
    dialCode: "+52",
    flag: "🇲🇽",
    pattern: /^[0-9]{10}$/,
    placeholder: "55 1234 5678",
    minLength: 10,
    maxLength: 10
  },
  {
    code: "ES",
    name: "Spain",
    dialCode: "+34",
    flag: "🇪🇸",
    pattern: /^[0-9]{9}$/,
    placeholder: "612 345 678",
    minLength: 9,
    maxLength: 9
  },
  {
    code: "AR",
    name: "Argentina",
    dialCode: "+54",
    flag: "🇦🇷",
    pattern: /^[0-9]{10}$/,
    placeholder: "11 1234 5678",
    minLength: 10,
    maxLength: 10
  },
  {
    code: "CO",
    name: "Colombia",
    dialCode: "+57",
    flag: "🇨🇴",
    pattern: /^[0-9]{10}$/,
    placeholder: "300 123 4567",
    minLength: 10,
    maxLength: 10
  },
  {
    code: "PE",
    name: "Peru",
    dialCode: "+51",
    flag: "🇵🇪",
    pattern: /^[0-9]{9}$/,
    placeholder: "987 654 321",
    minLength: 9,
    maxLength: 9
  },
  {
    code: "CL",
    name: "Chile",
    dialCode: "+56",
    flag: "🇨🇱",
    pattern: /^[0-9]{9}$/,
    placeholder: "9 8765 4321",
    minLength: 9,
    maxLength: 9
  },
];

const PhoneInput = ({ form, name = "contactNumber", required = true }) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  // Format phone number based on country
  const formatPhoneNumber = (value, country) => {
    const cleaned = value.replace(/\D/g, "");
    
    switch (country.code) {
      case "CR":
        return cleaned.replace(/(\d{4})(\d{4})/, "$1 $2");
      case "US":
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      case "MX":
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2 $3");
      case "ES":
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
      case "AR":
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2 $3");
      case "CO":
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
      case "PE":
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
      case "CL":
        return cleaned.replace(/(\d{1})(\d{4})(\d{4})/, "$1 $2 $3");
      default:
        return cleaned;
    }
  };

  // Validate phone number
  const validatePhone = useCallback((_, value) => {
    if (!required && !value) return Promise.resolve();
    if (required && !value) return Promise.reject(new Error("Por favor ingrese un número de contacto"));
    
    // Extract only the number part (remove dial code and formatting)
    const cleaned = value ? value.replace(/\D/g, "") : "";
    
    if (cleaned.length < selectedCountry.minLength) {
      return Promise.reject(new Error(`El número debe tener ${selectedCountry.minLength} dígitos`));
    }
    
    if (cleaned.length > selectedCountry.maxLength) {
      return Promise.reject(new Error(`El número no puede tener más de ${selectedCountry.maxLength} dígitos`));
    }
    
    if (!selectedCountry.pattern.test(cleaned)) {
      return Promise.reject(new Error(`Formato de número inválido para ${selectedCountry.name}`));
    }
    
    return Promise.resolve();
  }, [selectedCountry, required]);

  // Custom input component that combines flag, selector, and input
  const PhoneInputComponent = ({ value, onChange }) => {
    // Handle country selection
    const handleCountryChange = (countryCode) => {
      const country = countries.find(c => c.code === countryCode);
      setSelectedCountry(country);
      
      // Reset to empty when country changes
      onChange("");
    };

    // Handle phone number input - only allow numbers and formatting
    const handlePhoneChange = (e) => {
      let inputValue = e.target.value;
      
      // Extract only numbers
      const cleaned = inputValue.replace(/\D/g, "");
      
      // Limit to max length and only allow numbers
      if (cleaned.length <= selectedCountry.maxLength) {
        const formatted = formatPhoneNumber(cleaned, selectedCountry);
        onChange(formatted);
      }
    };

    // Prevent non-numeric input
    const handleKeyPress = (e) => {
      // Allow backspace, delete, arrow keys, etc.
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
        return;
      }
  
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    };

    return (
      <div className="flex w-full items-center gap-0">
        {/* Country Flag */}
        <div className="flex items-center justify-center w-12 h-10 px-3 bg-gray-100 border border-gray-300 border-r-0 rounded-l-md">
          <span className="text-lg">{selectedCountry.flag}</span>
        </div>
        
        {/* Country Selector - Extension/Code */}
        <Select
          value={selectedCountry.code}
          onChange={handleCountryChange}
          popupMatchSelectWidth={false}
          suffixIcon={<DownOutlined className="text-gray-400 text-xs" />}
          className="phone-input-select"
          style={{
            width: '100px',
            height: '40px',
          }}
        >
          {countries.map((country) => (
            <Option key={country.code} value={country.code}>
              <span className="text-xs text-gray-600">{country.dialCode}</span>
            </Option>
          ))}
        </Select>
        
        {/* Phone Number Input */}
        <Input
          value={value || ""}
          onChange={handlePhoneChange}
          onKeyDown={handleKeyPress}
          placeholder={selectedCountry.placeholder}
          className="phone-input-number h-10"
          style={{ 
            borderLeftWidth: 0,
            borderRadius: '0 6px 6px 0'
          }}
        />
      </div>
    );
  };

  return (
    <>
      <Form.Item
        label="Número de contacto"
        name={name}
        rules={[{ validator: validatePhone }]}
        className="mb-4"
      >
        <PhoneInputComponent />
      </Form.Item>
      
      <div className="text-xs text-gray-500 -mt-4 mb-4">
        Formato: {selectedCountry.dialCode} {selectedCountry.placeholder}
      </div>
    </>
  );
};

export default PhoneInput;