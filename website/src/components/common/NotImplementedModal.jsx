import React from 'react';

/**
 * NotImplementedModal Component
 * Reusable modal matching the custom frosted blur design of SuccessModal and ErrorModal
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback when modal is closed
 */
function NotImplementedModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-1000 p-4">
      <div className="bg-white rounded-lg p-8 sm:p-12 max-w-lg w-full mx-6 shadow-2xl animate-fadeIn">
        <div className="text-center">
          
          {/* Status Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl poppins-bold text-geoterra-blue mb-4">
            Función no disponible
          </h3>

          {/* Subtitle */}
          <h4 className="text-base font-semibold text-gray-800 poppins-medium mb-3">
            Esta función aún no está implementada
          </h4>

          {/* Main message */}
          <p className="text-sm text-gray-600 leading-relaxed poppins mb-6">
            Estamos trabajando en esta funcionalidad. Por el momento, puede contactarnos directamente 
            a través de nuestro correo electrónico o teléfono.
          </p>

          {/* Contact alternatives */}
          <div className="mb-8 p-4 bg-gray-50 rounded-md border border-gray-100 text-left">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 poppins-medium">
              Contacto directo:
            </p>
            <div className="space-y-1">
              <p className="text-sm text-geoterra-blue poppins">📧 contacto@geoterra.com</p>
              <p className="text-sm text-geoterra-blue poppins">📞 +506 (XXX) XXX-XXXX</p>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={onClose}
            className="px-8 py-4 bg-geoterra-orange hover:bg-orange-600 text-white poppins-bold rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-base sm:text-lg cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotImplementedModal;