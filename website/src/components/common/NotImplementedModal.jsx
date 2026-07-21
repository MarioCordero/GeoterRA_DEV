import React from 'react';

function NotImplementedModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1001 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 poppins-bold">
            Función no disponible
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-base font-medium text-gray-900 poppins-medium">
                Esta función aún no está implementada
              </h4>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed poppins">
            Estamos trabajando en esta funcionalidad. Por el momento, puede contactarnos directamente 
            a través de nuestro correo electrónico o teléfono.
          </p>
          
          {/* Contact alternatives */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-500 mb-2 poppins-medium">Contacto directo:</p>
            <div className="space-y-1">
              <p className="text-sm text-geoterra-blue">📧 contacto@geoterra.com</p>
              <p className="text-sm text-geoterra-blue">📞 +506 (XXX) XXX-XXXX</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-geoterra-blue text-white rounded-md hover:bg-blue-700 transition-colors duration-200 poppins-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotImplementedModal;