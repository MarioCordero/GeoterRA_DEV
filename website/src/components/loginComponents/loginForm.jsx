import "../../colorModule.css";
import '../../fontsModule.css';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authLogin, authPasswordResetRequest, authPasswordResetReset } from '../../config/apiConf';
import { useSession } from "../../hooks/useSession";
import loginImage from "../../assets/images/login-background.png";
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

function Login() {
  const navigate = useNavigate();
  const { refresh } = useSession();
  const bgImage = {
    backgroundImage: `url(${loginImage})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Password Reset Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: request code, 2: reset password, 3: success
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // Timer states (5 minutes = 300 seconds)
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (isResetModalOpen && resetStep === 2 && isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerActive) {
      setIsTimerActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResetModalOpen, resetStep, isTimerActive, timerSeconds]);

  const startOtpTimer = () => {
    setTimerSeconds(300);
    setIsTimerActive(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenResetModal = () => {
    setResetEmail(email || "");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setResetError("");
    setResetSuccess("");
    setResetStep(1);
    setIsTimerActive(false);
    setTimerSeconds(300);
    setIsResetModalOpen(true);
  };

  const handleCloseResetModal = () => {
    setIsResetModalOpen(false);
    setResetStep(1);
    setResetError("");
    setResetSuccess("");
    setIsTimerActive(false);
  };

  // Step 1 Submit: Request Reset Code
  const handleRequestResetCode = async (e) => {
    if (e) e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);

    try {
      const result = await authPasswordResetRequest({ email: resetEmail });

      if (result.ok) {
        const msg = result.data?.message || "El código de recuperación ha sido enviado a su correo electrónico.";
        setResetSuccess(msg);
        startOtpTimer();
        setTimeout(() => {
          setResetStep(2);
          setResetSuccess("");
        }, 1500);
      } else {
        setResetError(result.error || "No se pudo enviar el código de recuperación.");
      }
    } catch (err) {
      console.error('[PasswordResetRequest] Error:', err);
      setResetError("Error al procesar la solicitud de recuperación.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoToStep2 = () => {
    setResetError("");
    setResetSuccess("");
    setResetStep(2);
    if (!isTimerActive) {
      startOtpTimer();
    }
  };

  // Step 2 Submit: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (timerSeconds === 0) {
      setResetError("El código de recuperación ha expirado. Por favor solicite uno nuevo.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      setResetError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setResetLoading(true);

    try {
      const payload = {
        token: resetToken,
        new_password: newPassword,
      };
      const result = await authPasswordResetReset(payload);

      if (result.ok) {
        const msg = result.data?.message || "La contraseña se ha actualizado correctamente.";
        setResetSuccess(msg);
        setResetStep(3);
        setIsTimerActive(false);
      } else {
        setResetError(result.error || "No se pudo actualizar la contraseña. Verifique el código ingresado.");
      }
    } catch (err) {
      console.error('[PasswordResetReset] Error:', err);
      setResetError("Error al restablecer la contraseña.");
    } finally {
      setResetLoading(false);
    }
  };

  // Handle main login form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = { email, password };
      const result = await authLogin(payload);

      if (result.ok) {
        const sessionUser = await refresh();

        if (sessionUser) {
          navigate('/Dashboard');
        } else {
          console.error('[Login] sessionUser is null after refresh()');
          setErrorMsg('No se pudo establecer la sesión');
        }
        return;
      }

      const errorMessage = result.error || 'Credenciales incorrectas';
      console.error('[Login] Error:', errorMessage);
      setErrorMsg(errorMessage);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error('[Login] Exception:', err);
      setErrorMsg('Error de conexión con el servidor');
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
                    className="absolute top-0 right-0 mt-1 mr-2 text-red-500 hover:text-red-700 text-xl cursor-pointer"
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

              {/* PASSWORD INPUT WITH EYE TOGGLE */}
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-geoterra-blue poppins-bold">
                  Contraseña
                </h2>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Ingrese su contraseña"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 pr-10 sm:px-4 sm:py-3 border border-geoterra-blue rounded focus:outline-none focus:ring-1 focus:ring-blue-500 poppins disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-geoterra-blue bg-transparent border-none p-1 cursor-pointer flex items-center transition"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeInvisibleOutlined className="text-lg" /> : <EyeOutlined className="text-lg" />}
                  </button>
                </div>
              </div>

              {/* RECOVERY PASSWORD AND REMEMBER */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 text-xs sm:text-sm text-gray-600">
                <button
                  type="button"
                  onClick={handleOpenResetModal}
                  className="text-blue-600 hover:underline poppins order-2 sm:order-1 bg-transparent border-none p-0 m-0 cursor-pointer text-left"
                >
                  Recuperar contraseña
                </button>
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

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in relative border border-gray-100">
            {/* Header */}
            <div className="bg-geoterra-orange px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-lg sm:text-xl font-bold poppins-bold flex items-center gap-2">
                🔒 Recuperar Contraseña
              </h3>
              <button
                type="button"
                onClick={handleCloseResetModal}
                className="text-white hover:text-gray-200 text-2xl font-bold leading-none bg-transparent border-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {resetError && (
                <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start justify-between">
                  <span>{resetError}</span>
                  <button
                    type="button"
                    onClick={() => setResetError("")}
                    className="text-red-500 hover:text-red-700 ml-2 font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              {resetSuccess && (
                <div className="mb-4 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {resetSuccess}
                </div>
              )}

              {/* STEP 1: Request Code */}
              {resetStep === 1 && (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <p className="text-sm text-gray-600 poppins">
                    Ingrese la dirección de correo electrónico asociada a su cuenta. Le enviaremos un código de recuperación para restablecer su contraseña.
                  </p>

                  <div>
                    <label className="block text-sm font-semibold text-geoterra-blue mb-1 poppins-bold">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      disabled={resetLoading}
                      className="w-full px-3 py-2.5 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm poppins"
                    />
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full bg-geoterra-orange text-white py-2.5 rounded-lg font-bold hover:bg-cafe transition cursor-pointer disabled:opacity-50 text-sm poppins-bold"
                    >
                      {resetLoading ? "Enviando código..." : "Enviar código de recuperación"}
                    </button>

                    <button
                      type="button"
                      onClick={handleGoToStep2}
                      className="text-xs text-blue-600 hover:underline text-center pt-1 cursor-pointer bg-transparent border-none poppins"
                    >
                      ¿Ya tiene un código de recuperación? Ingrése aquí
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Reset Password with OTP Token & Countdown Timer */}
              {resetStep === 2 && (
                <div className="space-y-4">
                  {/* Countdown Timer Badge */}
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs sm:text-sm text-amber-900 font-medium poppins">
                    <span className="flex items-center gap-1.5 font-bold">
                      ⏱️ Tiempo restante para el código:
                    </span>
                    <span className={`font-mono text-sm font-bold ${timerSeconds < 60 ? 'text-red-600 animate-pulse' : 'text-amber-900'}`}>
                      {formatTime(timerSeconds)}
                    </span>
                  </div>

                  {timerSeconds === 0 ? (
                    <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg text-sm text-center space-y-3 poppins">
                      <p className="font-semibold">⚠️ El código de recuperación ha expirado.</p>
                      <button
                        type="button"
                        onClick={handleRequestResetCode}
                        disabled={resetLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold text-xs cursor-pointer transition poppins-bold"
                      >
                        {resetLoading ? "Solicitando..." : "Solicitar nuevo código"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <p className="text-sm text-gray-600 poppins">
                        Ingrese el código recibido en su correo y defina su nueva contraseña.
                      </p>

                      <div>
                        <label className="block text-sm font-semibold text-geoterra-blue mb-1 poppins-bold">
                          Código de recuperación (Token)
                        </label>
                        <input
                          type="text"
                          required
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                          placeholder="Ej. 384472"
                          disabled={resetLoading}
                          className="w-full px-3 py-2.5 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm tracking-wider font-mono"
                        />
                      </div>

                      {/* NEW PASSWORD WITH EYE TOGGLE */}
                      <div>
                        <label className="block text-sm font-semibold text-geoterra-blue mb-1 poppins-bold">
                          Nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Ingrese su nueva contraseña"
                            disabled={resetLoading}
                            className="w-full px-3 py-2.5 pr-10 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm poppins"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            tabIndex={-1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-geoterra-blue bg-transparent border-none p-1 cursor-pointer flex items-center transition"
                            title={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showNewPassword ? <EyeInvisibleOutlined className="text-base" /> : <EyeOutlined className="text-base" />}
                          </button>
                        </div>
                      </div>

                      {/* CONFIRM PASSWORD WITH EYE TOGGLE */}
                      <div>
                        <label className="block text-sm font-semibold text-geoterra-blue mb-1 poppins-bold">
                          Confirmar nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirme su nueva contraseña"
                            disabled={resetLoading}
                            className="w-full px-3 py-2.5 pr-10 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm poppins"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            tabIndex={-1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-geoterra-blue bg-transparent border-none p-1 cursor-pointer flex items-center transition"
                            title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showConfirmPassword ? <EyeInvisibleOutlined className="text-base" /> : <EyeOutlined className="text-base" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="w-full bg-geoterra-orange text-white py-2.5 rounded-lg font-bold hover:bg-cafe transition cursor-pointer disabled:opacity-50 text-sm poppins-bold"
                        >
                          {resetLoading ? "Actualizando..." : "Actualizar contraseña"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setResetError("");
                            setResetSuccess("");
                            setResetStep(1);
                            setIsTimerActive(false);
                          }}
                          className="text-xs text-blue-600 hover:underline text-center pt-1 cursor-pointer bg-transparent border-none poppins"
                        >
                          ← Reenviar código o cambiar correo
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 3: Success Confirmation */}
              {resetStep === 3 && (
                <div className="text-center py-4 space-y-4">
                  <div className="text-5xl">✅</div>
                  <h4 className="text-lg font-bold text-gray-800 poppins-bold">
                    ¡Contraseña actualizada!
                  </h4>
                  <p className="text-sm text-gray-600 poppins">
                    Su contraseña se ha actualizado correctamente. Ahora puede iniciar sesión con su nueva contraseña.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (resetEmail) setEmail(resetEmail);
                      handleCloseResetModal();
                    }}
                    className="w-full bg-geoterra-orange text-white py-2.5 rounded-lg font-bold hover:bg-cafe transition cursor-pointer text-sm poppins-bold"
                  >
                    Ir a Iniciar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;