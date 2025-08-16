import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../colorModule.css";
import '../../fontsModule.css';
import { buildApiUrl } from '../config/apiConf';

export default function Register() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_num: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("first_name", formData.first_name);
    form.append("last_name", formData.last_name);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("confirm_password", formData.confirm_password);
    form.append("phone_num", formData.phone_num);

    try {
      const response = await fetch(buildApiUrl("register.inc.php"), {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      console.log("API response:", data);

      if (data.response === "Ok") {
        // Redirect to login or another page
        navigate("/Logged");
      } else {
        // Handle registration error (show message, etc.)
        alert(data.message || "Error en el registro");
      }
    } catch (err) {
      console.log("API response:", err);
      alert("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4 bg-gris">
        <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-md mt-20">
          <h1 className="text-4xl poppins-bold text-center mb-7">Registrarse</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block poppins-bold mb-1">Nombre</label>
              <input
                name="first_name"
                type="text"
                placeholder="Ingrese su nombre"
                required
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full poppins-light px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block poppins-bold mb-1">Apellido</label>
              <input
                name="last_name"
                type="text"
                placeholder="Ingrese su apellido"
                required
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full poppins-light px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block poppins-bold mb-1">Contraseña</label>
              <input
                name="password"
                type="password"
                placeholder="Ingrese una contraseña para su cuenta"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full poppins-light px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block poppins-bold mb-1">Confirmar contraseña</label>
              <input
                name="confirm_password"
                type="password"
                placeholder="Ingrese otra vez su contraseña"
                required
                value={formData.confirm_password}
                onChange={handleInputChange}
                className="w-full poppins-light px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block poppins-bold mb-1">Correo electrónico</label>
              <input
                name="email"
                type="email"
                placeholder="Ingrese su correo electrónico"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full poppins-light px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block poppins-bold mb-1">Teléfono</label>
              <input
                name="phone_num"
                type="tel"
                placeholder="Ingrese su número de teléfono"
                required
                value={formData.phone_num}
                onChange={handleInputChange}
                className="w-full poppins-light px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full max-w-1/3 block m-auto poppins-bold bg-geoterra-orange text-white py-3 px-4 rounded-md font-bold hover:bg-cafe transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-10"
            >
              Registrarse
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}