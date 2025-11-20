import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../../assets/images/login-background.png";
import "../../colorModule.css";
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';

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
  const [loading, setLoading] = useState(false);

  // Session token management
  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const setSessionToken = (token) => {
    localStorage.setItem('geoterra_session_token', token);
  };

  const clearSessionToken = () => {
    localStorage.removeItem('geoterra_session_token');
  };

  // Build headers with session token if available
  const buildHeaders = () => {
    const headers = {};
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  // Function to get user info after successful login
  const getUserInfo = async (email) => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      
      const response = await fetch(buildApiUrl("user_info.php"), {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: buildHeaders(),
      });
      
      const data = await response.json();
      
      if (data.response === "Ok" && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error getting user info:", error);
      return null;
    }
  };

  // DEBUG Check session status
  const checkSessionStatus = async () => {
    try {
      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking session:", error);
      return null;
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await fetch(buildApiUrl("login.inc.php"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (data.response === "Ok") {
        // Store session token from login response
        if (data.data && data.data.session_token) {
          console.log("🎯 Storing session token:", data.data.session_token);
          setSessionToken(data.data.session_token);
        } else {
          console.warn("⚠️ No session token in login response!");
        }

        // Check session after login
        const sessionData = await checkSessionStatus();

        // Login successful, now get user info to check role
        const userInfo = await getUserInfo(email);
        
        if (userInfo) {
          // Check user role and redirect accordingly
          if (userInfo.rol === "admin") {
            navigate("/LoggedAdmin"); 
          } else {
            navigate("/Logged");
          }
        } else {
          // If we can't get user info, default to regular user page
          console.log("Could not get user info, defaulting to regular user page");
          navigate("/Logged");
        }
      } else {
        setErrorMsg(data.message || "Credenciales incorrectas");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setErrorMsg("Error de conexión");
      setEmail("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  // Handle closing the error message
  const handleCloseError = () => {
    setErrorMsg("");
    setEmail("");
    setPassword("");
  };

  // Handle logout (can be called from other components)
  const handleLogout = () => {
    clearSessionToken();
    navigate("/");
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
          {/* Form container with responsive padding and sizing */}
          <div className="bg-gris rounded-lg shadow-md p-6 sm:p-8 w-full">
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} id="login_form">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-geoterra-orange mb-4 sm:mb-6 poppins-bold">
                Iniciar Sesión
              </h1>
              
              {/* Error Message */}
              {errorMsg && (
                <div id="credential-error-container" className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded relative active">
                  <span className="block text-sm sm:text-base pr-6">{errorMsg}</span>
                  <button
                    id="close-error-msg"
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

              {/* RECOVERY PASSWORD LINK AND REMEMBER PASSWORD CHECKBOX */}
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
                    className="text-gray-700 select-none hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed poppins"
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
                  style={{ background: "none" }}
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