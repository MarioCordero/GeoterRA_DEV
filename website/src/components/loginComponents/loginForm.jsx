import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import { auth, users } from '../../config/apiConf';
import loginImage from "../../assets/images/login-background.png";
import "../../colorModule.css";
import '../../fontsModule.css';

function Login() {
  const navigate = useNavigate();
  const { setTokens } = useSession();
  const bgImage = {
    backgroundImage: `url(${loginImage})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submit
const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg("");
  setLoading(true);

  try {
    const response = await fetch(auth.login(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    if (response.ok && data.data && data.data.access_token) {
      setTokens(data.data.access_token, data.data.refresh_token);
      const userResponse = await fetch(users.me(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.data.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        if (userData.data && userData.data.role === 'admin') {
          navigate('/LoggedAdmin');
        } else {
          navigate('/Logged');
        }
      } else {
        navigate('/Logged');
      }
    } else {
      let errorMessage = 'Credenciales incorrectas';
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        if (typeof data.errors[0] === 'object' && data.errors[0].message) {
          errorMessage = data.errors[0].message;
        } else {
          errorMessage = String(data.errors[0]);
        }
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      setErrorMsg(errorMessage);
      setEmail("");
      setPassword("");
    }
  } catch (err) {
    console.error('Login request failed:', err);
    setErrorMsg('Error de conexión con el servidor');
    setEmail("");
    setPassword("");
  } finally {
    setLoading(false);
  }
};

  const handleCloseError = () => {
    setErrorMsg("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* Background layers */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          ...bgImage,
          filter: "blur(4px)",
          opacity: 0.7,
        }}
      ></div>
      <div className="absolute inset-0 bg-red/30 z-0"></div>

      {/* Responsive container */}
      <div className="flex-1 flex items-center justify-center relative z-10 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto">
          {/* Form container */}
          <div className="bg-gris rounded-lg shadow-md p-6 sm:p-8 w-full">
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-geoterra-orange mb-4 sm:mb-6 poppins-bold">
                Iniciar Sesión
              </h1>
              
              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded relative">
                  <span className="block text-sm sm:text-base pr-6">{errorMsg}</span>
                  <button
                    type="button"
                    onClick={handleCloseError}
                    className="absolute top-0 right-0 mt-1 mr-2 text-red-500 hover:text-red-700 text-xl"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-center">
                  <span className="text-sm sm:text-base">Verificando credenciales...</span>
                </div>
              )}

              {/* EMAIL INPUT */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-geoterra-blue poppins-bold">
                  Correo
                </h2>
                <input
                  type="email"
                  name="email"
                  placeholder="Ingrese su correo electrónico"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-geoterra-blue rounded focus:outline-none focus:ring-1 focus:ring-blue-500 poppins disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                />
              </div>

              {/* PASSWORD INPUT */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-geoterra-blue poppins-bold">
                  Contraseña
                </h2>
                <input
                  type="password"
                  name="password"
                  placeholder="Ingrese su contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-geoterra-blue rounded focus:outline-none focus:ring-1 focus:ring-blue-500 poppins disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                />
              </div>

              {/* RECOVERY PASSWORD AND REMEMBER */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 text-xs sm:text-sm text-gray-600">
                <a href="#" className="text-blue-600 hover:underline poppins order-2 sm:order-1">
                  Recuperar contraseña
                </a>
                <div className="flex items-center order-1 sm:order-2">
                  <input
                    id="remember"
                    type="checkbox"
                    disabled={loading}
                    className="mr-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label 
                    htmlFor="remember" 
                    className="text-gray-700 select-none hover:cursor-pointer poppins"
                  >
                    Recordar contraseña
                  </label>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-geoterra-orange text-white py-2 sm:py-3 rounded font-bold hover:bg-cafe transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed poppins-bold text-sm sm:text-base"
                >
                  {loading ? "Verificando..." : "Acceder"}
                </button>
              </div>

              {/* REGISTER LINK */}
              <div className="text-center text-xs sm:text-sm poppins pt-2">
                ¿No tiene cuenta?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/Register")}
                  disabled={loading}
                  className="text-blue-600 hover:underline font-bold bg-transparent border-none p-0 m-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Registrarse
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;