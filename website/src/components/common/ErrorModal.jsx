import React from 'react';

const ErrorModal = ({ visible, errorMessage, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-white/30 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-1000">
      <div className="bg-white rounded-lg p-8 sm:p-12 max-w-lg w-full mx-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h3 className="text-2xl sm:text-3xl poppins-bold text-geoterra-blue mb-4">
            Error
          </h3>
          <p className="text-base sm:text-lg text-gray-600 poppins mb-8 leading-relaxed">
            {errorMessage || 'Ha ocurrido un error inesperado'}
          </p>
          <button
            onClick={onClose}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white poppins-bold rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-base sm:text-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
