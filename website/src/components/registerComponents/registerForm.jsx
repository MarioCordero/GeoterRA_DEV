import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../colorModule.css";
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';

export default function Register() {

  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_num: ''
  });

  // Freeze/unfreeze scroll when modal opens/closes
  useEffect(() => {
    if (showSuccessModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSuccessModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Allow multiple names in first_name field (letters, spaces, and common name characters)
    if (name === 'first_name') {
      // Allow letters, spaces, hyphens, and apostrophes for compound names
      const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-']*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid characters
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Debug: Print current form state
    console.log("=== FORM DATA DEBUG ===");
    console.log("Raw form data:", formData);

    // Trim and clean the first name before sending
    const cleanFirstName = formData.first_name.trim().replace(/\s+/g, ' ');

    // Debug: Show cleaned first name
    console.log("Cleaned first_name:", cleanFirstName);

    const form = new FormData();
    form.append("first_name", cleanFirstName);
    form.append("last_name", formData.last_name);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("confirm_password", formData.confirm_password);
    form.append("phone_num", formData.phone_num);

    // Debug: Print FormData as JSON-like object
    console.log("=== FORM DATA BEING SENT ===");
    const formDataObject = {};
    for (let [key, value] of form.entries()) {
      formDataObject[key] = value;
    }
    console.log("FormData as object:", formDataObject);
    console.log("FormData as JSON:", JSON.stringify(formDataObject, null, 2));

    try {
      const response = await fetch(buildApiUrl("register.inc.php"), {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      // Debug: Print API response
      // console.log("=== API RESPONSE ===");
      // console.log("API response:", data);
      // console.log("Response as JSON:", JSON.stringify(data, null, 2));

      if (data.response === "Ok") {
        // Show success popup instead of navigating
        setShowSuccessModal(true);
      } else {
        // Handle registration error (show message, etc.)
        // Debug
        // console.log("=== REGISTRATION ERROR ===");
        // console.log("Error message:", data.message);
        // console.log("Errors array:", data.errors);
        alert(data.message || "Error en el registro");
      }
    } catch (err) {
      // Debug
      // console.log("=== FETCH ERROR ===");
      // console.log("API response:", err);
      // console.log("Error details:", err.message);
      alert("Error de conexión");
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 bg-gris">
        
        {/* Form Container */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-lg sm:shadow-xl mt-16 sm:mt-20">
          
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl poppins-bold text-center mb-4 sm:mb-6 md:mb-7 text-geoterra-blue">
            Registrarse
          </h1>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
            
            {/* Name and Last Name - Two columns on larger screens */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
              <div className="flex-1">
                <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                  Nombre(s)
                </label>
                <input
                  name="first_name"
                  type="text"
                  placeholder="Ingrese su(s) nombre(s)"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full poppins-light px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  title="Puede ingresar uno o varios nombres (ej: Mario Gabriel)"
                />
                <small className="text-xs text-gray-500 mt-1">
                  Puede ingresar varios nombres separados por espacio
                </small>
              </div>

              <div className="flex-1">
                <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                  Apellido(s)
                </label>
                <input
                  name="last_name"
                  type="text"
                  placeholder="Ingrese su(s) apellido(s)"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full poppins-light px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                placeholder="Ingrese su correo electrónico"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full poppins-light px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                Teléfono
              </label>
              <input
                name="phone_num"
                type="tel"
                placeholder="Ingrese su número de teléfono"
                required
                value={formData.phone_num}
                onChange={handleInputChange}
                className="w-full poppins-light px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            {/* Password Fields - Two columns on larger screens */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
              <div className="flex-1">
                <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                  Contraseña
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Ingrese una contraseña"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full poppins-light px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>

              <div className="flex-1">
                <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                  Confirmar contraseña
                </label>
                <input
                  name="confirm_password"
                  type="password"
                  placeholder="Confirme su contraseña"
                  required
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="w-full poppins-light px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Terms and Privacy - Mobile only */}
            <div className="md:hidden text-xs text-gray-600 leading-relaxed pt-2">
              Al registrarse, acepta nuestros{' '}
              <span className="text-geoterra-blue cursor-pointer hover:underline">términos de servicio</span>{' '}
              y{' '}
              <span className="text-geoterra-blue cursor-pointer hover:underline">política de privacidad</span>.
            </div>

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6 md:pt-8">
              <button
                type="submit"
                className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto block poppins-bold bg-geoterra-orange hover:bg-orange-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-md font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base md:text-lg"
              >
                Registrarse
              </button>
            </div>

            {/* Terms and Privacy - Desktop */}
            <div className="hidden md:block text-sm text-gray-600 text-center leading-relaxed pt-4">
              Al registrarse, acepta nuestros{' '}
              <span className="text-geoterra-blue cursor-pointer hover:underline">términos de servicio</span>{' '}
              y{' '}
              <span className="text-geoterra-blue cursor-pointer hover:underline">política de privacidad</span>.
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 sm:pt-6">
              <p className="text-sm sm:text-base text-gray-600 poppins">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-geoterra-blue hover:text-orange-600 font-semibold hover:underline transition-colors duration-200"
                >
                  Iniciar Sesión
                </button>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal - Full Screen */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-white/30 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-1000">
          <div className="bg-white rounded-lg p-8 sm:p-12 max-w-lg w-full mx-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl poppins-bold text-geoterra-blue mb-4">
                ¡Registro Exitoso!
              </h3>
              <p className="text-base sm:text-lg text-gray-600 poppins mb-8 leading-relaxed">
                Gracias por registrarse, ahora inicie sesión
              </p>
              <button
                onClick={handleModalClose}
                className="px-8 py-4 bg-geoterra-orange hover:bg-orange-600 text-white poppins-bold rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-base sm:text-lg"
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}