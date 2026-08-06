import React, { useEffect } from 'react';

/**
 * Reusable Success Modal Component
 * Matches the custom styling used on ErrorModal (Frosted blur full-screen overlay)
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.subtitle - Subtitle/subheader message
 * @param {string} props.message - Main success message
 * @param {string} props.status - Result status: "success" | "info" | "warning" (default: "success")
 * @param {string} props.confirmText - Primary button text (default: "Continuar")
 * @param {string} props.secondaryText - Secondary button text (optional, e.g., "Volver")
 * @param {Function} props.onConfirm - Callback when primary button is clicked
 * @param {Function} props.onSecondary - Callback when secondary button is clicked
 * @param {boolean} props.autoClose - Auto-close after delay (default: false)
 * @param {number} props.autoCloseDelay - Delay in ms before auto-closing (default: 3000)
 * @param {boolean} props.showIcon - Show status icon (default: true)
 */
const SuccessModal = ({
  open,
  title,
  subtitle,
  message,
  status = 'success',
  confirmText = 'Continuar',
  secondaryText,
  onConfirm,
  onSecondary,
  autoClose = false,
  autoCloseDelay = 3000,
  showIcon = true,
}) => {
  // Auto-close effect
  useEffect(() => {
    if (autoClose && open) {
      const timer = setTimeout(() => {
        onConfirm?.();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, open, autoCloseDelay, onConfirm]);

  if (!open) return null;

  // Choose colors and SVG paths based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          btnBg: 'bg-yellow-600 hover:bg-yellow-700',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          ),
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          btnBg: 'bg-blue-600 hover:bg-blue-700',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ),
        };
      case 'success':
      default:
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          btnBg: 'bg-geoterra-orange hover:bg-orange-600',
          iconPath: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          ),
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed inset-0 bg-white/30 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-1000">
      <div className="bg-white rounded-lg p-8 sm:p-12 max-w-lg w-full mx-6 shadow-2xl">
        <div className="text-center">
          {showIcon && (
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${config.iconBg} mb-6`}>
              <svg
                className={`h-8 w-8 ${config.iconColor}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {config.iconPath}
              </svg>
            </div>
          )}

          <h3 className="text-2xl sm:text-3xl poppins-bold text-geoterra-blue mb-4">
            {title || 'Operación Exitosa'}
          </h3>

          {subtitle && (
            <p className="text-sm text-gray-500 poppins mb-2 leading-relaxed">
              {subtitle}
            </p>
          )}

          {message && (
            <p className="text-base sm:text-lg text-gray-600 poppins mb-8 leading-relaxed">
              {message}
            </p>
          )}

          <div className="flex justify-center space-x-4">
            {secondaryText && (
              <button
                onClick={onSecondary}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 poppins-bold rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-base sm:text-lg cursor-pointer"
              >
                {secondaryText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`px-8 py-4 ${config.btnBg} text-white poppins-bold rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-base sm:text-lg cursor-pointer`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;