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
        headers: buildHeaders(),  // Add session token header
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
      console.log("Making session check request...");
      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(),  // Add session token header
      });
      
      const data = await response.json();
      console.log("Session check response:", data);
      return data;
    } catch (error) {
      console.error("Error checking session:", error);
      return null;
    }
  };  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // DEBUG: Check session before login
    console.log("=== SESSION DEBUG - BEFORE LOGIN ===");
    await checkSessionStatus();

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
      console.log("Login API response:", data);

      if (data.response === "Ok") {
        // 🔥 STORE SESSION TOKEN from login response
        if (data.data && data.data.session_token) {
          console.log("🎯 Storing session token:", data.data.session_token);
          setSessionToken(data.data.session_token);
        } else {
          console.warn("⚠️ No session token in login response!");
        }

        // DEBUG: Check session after login
        console.log("=== SESSION DEBUG - AFTER LOGIN ===");
        const sessionData = await checkSessionStatus();

        // Login successful, now get user info to check role
        const userInfo = await getUserInfo(email);
        
        if (userInfo) {
          console.log("User info:", userInfo);
          
          // DEBUG: Final session check before redirect
          console.log("=== SESSION DEBUG - BEFORE REDIRECT ===");
          const finalSessionCheck = await checkSessionStatus();
          
          // Additional validation using session data
          if (sessionData && sessionData.response === "Ok" && sessionData.data.status === "logged_in") {
            console.log("✅ Session confirmed active via check_session.php");
            console.log("Session user:", sessionData.data.user);
            console.log("User role from session:", sessionData.data.user_type);
            console.log("Is admin from session:", sessionData.data.is_admin);
          } else {
            console.log("⚠️ Session check indicates user may not be properly logged in");
          }
          
          // Check user role and redirect accordingly
          if (userInfo.rol === "admin") {
            console.log("Admin user detected, redirecting to admin panel");
            navigate("/LoggedAdmin"); 
          } else {
            console.log("Regular user detected, redirecting to logged page");
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

            {/* Loading indicator */}
            {loading && (
              <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded text-center">
                <span>Verificando credenciales...</span>
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
                disabled={loading}
                className="w-full px-4 py-2 border border-geoterra-blue rounded focus:outline-none focus:ring-1 focus:ring-blue-500 poppins disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={loading}
                className="w-full px-4 py-2 border border-geoterra-blue rounded focus:outline-none focus:ring-1 focus:ring-blue-500 poppins disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* RECOVERY PASSWORD LINK AND REMEMBER PASSWORD CHECKBOX */}
            <div className="flex justify-between text-sm text-gray-600">
              <a href="#" className="text-blue-600 hover:underline block poppins">Recuperar contraseña</a>
              <div className="flex items-center mb-2">
                <input
                  id="remember"
                  type="checkbox"
                  disabled={loading}
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
                disabled={loading}
                className="w-full bg-geoterra-orange text-white py-2 rounded font-bold hover:bg-cafe transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed poppins-bold"
              >
                {loading ? "Verificando..." : "Acceder"}
              </button>
            </div>

            {/* REGISTER LINK */}
            <div className="text-center text-sm poppins">
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
  );
}

export default Login;