import React, { useState } from "react";
import loginImage from "../../assets/images/login-background.png";
import "../../colorModule.css"; // Import your CSS file for styles

function Login() {
  const bgImage = {
    backgroundImage: `url(${loginImage})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

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
    <div className="min-h-screen flex bg-gray-100 relative">

      {/* Capa de fondo con efectos */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          ...bgImage,
          filter: "blur(4px)",
          opacity: 0.7,
        }}
      ></div>
      
      {/* Capa de luz blanca semi-transparente */}
      <div className="absolute inset-0 bg-red/30 z-0"></div>

      {/* Formulario alineado a la derecha */}
      <div className="flex-1 flex justify-end items-center relative z-10 h-screen">
        <div className="bg-gris max-w-1/2 rounded-lg shadow-md p-8 w-full h-screen flex flex-col justify-center">

          {/* FORM */}
          <form className="w-2/4 space-y-4 block  m-auto" onSubmit={handleSubmit}>
            <h1 className="text-4xl font-bold text-center bold text-geoterra-orange mb-2">Iniciar Sesión</h1>
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

            {/* EMAIL INPUT */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-geoterra-blue">Correo</h2>
              <input
                type="email"
                placeholder="Ingrese su correo electrónico"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-geoterra-blue rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <h2 className="text-lg font-semibold mb-1 text-geoterra-blue">Contraseña</h2>
              <input
                type="password"
                placeholder="Ingrese su contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-geoterra-blue rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* RECOVERY PASSWORD LINK AND REMEMBER PASSWORD CHECKBOX */}
            <div className="flex justify-between text-sm text-gray-600 space-y-2">

              <a href="#" className="text-blue-600 hover:underline block">Recuperar contraseña</a>

              <div className="flex items-center mb-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="mr-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="remember" className="text-gray-700 select-none hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  Recordar contraseña
                </label>
              </div>

            </div>

            {/* SUBMIT BUTTON */}
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full bg-geoterra-orange text-white py-2 rounded font-bold hover:bg-cafe transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Acceder
              </button>
            </div>

            {/* REGISTER LINK */}
            <div className="text-center text-sm">
              ¿No tiene cuenta?{" "}
              <a href="/register.php" className="text-blue-600 hover:underline font-bold">
                Registrarse
              </a>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;