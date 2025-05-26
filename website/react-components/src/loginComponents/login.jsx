import React, { useState } from "react";
import loginImage from "../assets/images/login-background.png"; // Add your image path here

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch("/API/login.inc.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "logged_in") {
        window.location.href = "/logged.php";
      } else {
        setErrorMsg("Credenciales incorrectas");
      }
    } catch (err) {
      setErrorMsg("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        {/* Login Image */}
        <div className="flex justify-center mb-6">
          <img 
            src={loginImage} 
            alt="Login Illustration" 
            className="h-32 object-contain"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Iniciar Sesión</h1>
        
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Correo</h2>
        
        {/* Rest of your form remains the same */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block">{errorMsg}</span>
              <button
                onClick={() => setErrorMsg("")}
                className="absolute top-0 right-0 mt-1 mr-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          <div>
            <p className="text-gray-600 mb-1">Ingrese su correo electrónico</p>
            <input
              type="email"
              placeholder="Correo electrónico"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Contraseña</h2>
            <p className="text-gray-600 mb-1">Ingrese su contraseña</p>
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>Diversas personas</p>
            <a href="#" className="text-blue-600 hover:underline block">Recuperar contraseña</a>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition"
            >
              Acceder
            </button>
            <button
              type="button"
              className="w-full bg-gray-600 text-white py-2 rounded font-bold hover:bg-gray-700 transition"
            >
              Acceder (ADMIN)
            </button>
          </div>

          <div className="text-center text-sm">
            ¿No tiene cuenta?{" "}
            <a href="/register.php" className="text-blue-600 hover:underline font-bold">
              Registrarse
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;