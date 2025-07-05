import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../../assets/images/login-background.png";
import "../../colorModule.css";
import '../../fontsModule.css';

function Login() {
  const navigate = useNavigate();
  const bgImage = {
    backgroundImage: `url(${loginImage})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      console.log("Sending login request...");
      // http://geoterra.com/API/login.inc.php
      // http://163.178.171.105/API/login.inc.php
      const response = await fetch("http://163.178.171.105/API/login.inc.php", {
        method: "POST",
        body: formData,
        credentials: "include", // Important: include credentials for session
      });

      const data = await response.json();

      console.log("API response:", data);

      if (data.response === "Ok") {
        console.log("Login successful, navigating to /Logged");
          try {
            // http://geoterra.com/API/check_session.php
            // http://163.178.171.105/API/check_session.php
            const sessionRes = await fetch("http://163.178.171.105/API/check_session.php", {
              method: "GET",
              credentials: "include",
            });
            const sessionData = await sessionRes.json();
              console.log("Session check after login:", sessionData);
          } catch (err) {
            console.error("Session check after login failed:", err);
          }
        navigate("/Logged");
      } else {
        console.log("Login failed, wrong credentials");
        setErrorMsg("Credenciales incorrectas");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setErrorMsg("Error de conexión");
      setEmail("");
      setPassword("");
    }
  };

  // Handle closing the error message
  const handleCloseError = () => {
    setErrorMsg("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* ...background layers... */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          ...bgImage,
          filter: "blur(4px)",
          opacity: 0.7,
        }}
      ></div>
      <div className="absolute inset-0 bg-red/30 z-0"></div>

      {/* Formulario alineado a la derecha */}
      <div className="flex-1 flex justify-end items-center relative z-10 h-screen">
        <div className="bg-gris max-w-1/2 rounded-lg shadow-md p-8 w-full h-screen flex flex-col justify-center">
          <form className="w-2/4 space-y-4 block m-auto" onSubmit={handleSubmit} id="login_form">
            <h1 className="text-4xl font-bold text-center bold text-geoterra-orange mb-2 poppins-bold">Iniciar Sesión</h1>
            
            {/* Error Message */}
            {errorMsg && (
              <div id="credential-error-container" className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative active">
                <span className="block">{errorMsg}</span>
                <button
                  id="close-error-msg"
                  type="button"
                  onClick={handleCloseError}
                  className="absolute top-0 right-0 mt-1 mr-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}

            {/* EMAIL INPUT */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-geoterra-blue poppins-bold">Correo</h2>
              <input
                type="email"
                name="email"
                placeholder="Ingrese su correo electrónico"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-geoterra-blue rounded focus:outline-none focus:ring-1 focus:ring-blue-500 poppins"
              />
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <h2 className="text-lg font-semibold mb-1 text-geoterra-blue poppins-bold">Contraseña</h2>
              <input
                type="password"
                name="password"
                placeholder="Ingrese su contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-geoterra-blue rounded focus:outline-none focus:ring-1 focus:ring-blue-500 poppins"
              />
            </div>

            {/* RECOVERY PASSWORD LINK AND REMEMBER PASSWORD CHECKBOX */}
            <div className="flex justify-between text-sm text-gray-600">
              <a href="#" className="text-blue-600 hover:underline block poppins">Recuperar contraseña</a>
              <div className="flex items-center mb-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="mr-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="remember" className="text-gray-700 select-none hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed poppins">
                  Recordar contraseña
                </label>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full bg-geoterra-orange text-white py-2 rounded font-bold hover:bg-cafe transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed poppins-bold"
              >
                Acceder
              </button>
            </div>

            {/* REGISTER LINK */}
            <div className="text-center text-sm poppins">
              ¿No tiene cuenta?{" "}
              {/* TODO REGISTER COMPONENT */}
                <button
                  type="button"
                  onClick={() => navigate("/Register")}
                  className="text-blue-600 hover:underline font-bold bg-transparent border-none p-0 m-0 cursor-pointer"
                  style={{ background: "none" }}
                >
                  Registrarse
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;