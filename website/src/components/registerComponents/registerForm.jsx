import "../../colorModule.css";
import "../../fontsModule.css";
import { Form, Input } from "antd";
import ErrorModal from "../common/ErrorModal";
import PhoneInput from "../common/PhoneInput";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../common/SuccessModal";
import React, { useState, useEffect } from "react";
import { userRegister } from "../../config/apiConf";
import NotImplementedModal from "../common/NotImplementedModal";

export default function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showNotImplementedModal, setShowNotImplementedModal] = useState(false);

  // Freeze/unfreeze scroll when modal opens/closes
  useEffect(() => {
    if (showSuccessModal || showErrorModal || showNotImplementedModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSuccessModal, showErrorModal, showNotImplementedModal]);

  const handleFinish = async (values) => {
    // Trim and clean names before sending
    const cleanFirstName = (values.first_name || "").trim().replace(/\s+/g, " ");
    const cleanLastName = (values.last_name || "").trim().replace(/\s+/g, " ");
    const cleanEmail = (values.email || "").trim();

    // Extract only digits from phone (PhoneInput stores formatted string)
    const phoneDigits = (values.phone_num || "").replace(/\D/g, "");

    const payload = {
      first_name: cleanFirstName,
      last_name: cleanLastName,
      email: cleanEmail,
      phone_number: phoneDigits || null,
      password: values.password,
    };

    try {
      const result = await userRegister(payload);

      if (result.ok && result.data) {
        setShowSuccessModal(true);
      } else if (result.error) {
        setErrorMessage(result.error);
        setShowErrorModal(true);
      } else {
        setErrorMessage("Error en el registro");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage("Error de conexión");
      setShowErrorModal(true);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/login");
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

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            autoComplete="off"
            className="space-y-3 sm:space-y-4 md:space-y-5"
          >
            {/* Name and Last Name - Two columns on larger screens */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
              <div className="flex-1">
                <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                  Nombre(s)
                </label>
                <Form.Item
                  name="first_name"
                  rules={[
                    { required: true, message: "Ingrese su(s) nombre(s)" },
                    {
                      pattern: /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-']*$/,
                      message:
                        "Solo se permiten letras, espacios, guiones y apóstrofes",
                    },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Ingrese su(s) nombre(s)"
                    className="poppins-light px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    title="Puede ingresar uno o varios nombres (ej: Mario Gabriel)"
                  />
                </Form.Item>
                <small className="text-xs text-gray-500 mt-1">
                  Puede ingresar varios nombres separados por espacio
                </small>
              </div>

              <div className="flex-1">
                <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                  Apellido(s)
                </label>
                <Form.Item
                  name="last_name"
                  rules={[{ required: true, message: "Ingrese su(s) apellido(s)" }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Ingrese su(s) apellido(s)"
                    className="poppins-light px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                Correo electrónico
              </label>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Ingrese su correo electrónico" },
                  { type: "email", message: "Ingrese un correo válido" },
                ]}
                className="mb-0"
              >
                <Input
                  type="email"
                  placeholder="Ingrese su correo electrónico"
                  className="poppins-light px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </Form.Item>
            </div>

            {/* Phone using PhoneInput component */}
            <div>
              {/* PhoneInput renders its own label */}
              <PhoneInput form={form} name="phone_num" required={true} />
            </div>

            {/* Password Fields - Two columns on larger screens */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
              <div className="flex-1">
                <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                  Contraseña
                </label>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Ingrese una contraseña" }]}
                  className="mb-0 "
                >
                  <Input.Password
                    placeholder="Ingrese una contraseña"
                    className="poppins-light px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </Form.Item>
              </div>

              <div className="flex-1">
                <label className="block poppins-bold mb-1 sm:mb-2 text-sm sm:text-base text-geoterra-blue">
                  Confirmar contraseña
                </label>
                <Form.Item
                  name="confirm_password"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Confirme su contraseña" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Las contraseñas no coinciden")
                        );
                      },
                    }),
                  ]}
                  className="mb-0 "
                >
                  <Input.Password
                    placeholder="Confirme su contraseña"
                    className="poppins-light px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Terms and Privacy - Mobile only */}
            <div className="md:hidden text-xs text-gray-600 leading-relaxed pt-2">
              Al registrarse, acepta nuestros{" "}
              <span 
                onClick={() => setShowNotImplementedModal(true)}
                className="text-geoterra-blue cursor-pointer hover:underline"
              >
                términos de servicio
              </span>{" "}
              y{" "}
              <span 
                onClick={() => setShowNotImplementedModal(true)}
                className="text-geoterra-blue cursor-pointer hover:underline"
              >
                política de privacidad
              </span>
              .
            </div>

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6 md:pt-8">
              <button
                type="submit"
                className="cursor-pointer w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto block poppins-bold bg-geoterra-orange hover:bg-orange-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-md font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base md:text-lg"
              >
                Registrarse
              </button>
            </div>

            {/* Terms and Privacy - Desktop */}
            <div className="hidden md:block text-sm text-gray-600 text-center leading-relaxed pt-4">
              Al registrarse, acepta nuestros{" "}
              <span 
                onClick={() => setShowNotImplementedModal(true)}
                className="text-geoterra-blue cursor-pointer hover:underline"
              >
                términos de servicio
              </span>{" "}
              y{" "}
              <span 
                onClick={() => setShowNotImplementedModal(true)}
                className="text-geoterra-blue cursor-pointer hover:underline"
              >
                política de privacidad
              </span>
              .
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 sm:pt-6">
              <p className="text-sm sm:text-base text-gray-600 poppins">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-geoterra-blue hover:text-orange-600 font-semibold hover:underline transition-colors duration-200"
                >
                  Iniciar Sesión
                </button>
              </p>
            </div>
          </Form>
        </div>
      </main>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        title="¡Registro Exitoso!"
        message="Gracias por registrarse, ahora inicie sesión"
        confirmText="Ir a Iniciar Sesión"
        onConfirm={handleModalClose}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        errorMessage={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />

      {/* NotImplemented Modal */}
      <NotImplementedModal
        isOpen={showNotImplementedModal}
        onClose={() => setShowNotImplementedModal(false)}
      />
    </div>
  );
}