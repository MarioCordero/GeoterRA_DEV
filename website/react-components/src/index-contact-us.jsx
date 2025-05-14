import React from 'react';
import FondoContactUs from "./assets/images/trabajo-campo2.jpeg";

function IndexContactUs() {
  return (
    <div className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      {/* Background Layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${FondoContactUs})`, // Set the background image
          backgroundRepeat: "no-repeat", // Prevent the image from repeating
          backgroundSize: "cover", // Make the image cover the entire container
          backgroundPosition: "center", // Center the image
          filter: "blur(8px)", // Apply blur effect
          opacity: 0.5, // Set opacity to 50%
          zIndex: 0, // Ensure it stays behind the content

        }}
      ></div>

      {/* Content */}
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-black mb-4">Contactá con nosotros</h1>
          <p className="text-1xs text-black">
            Gracias por su interés en GeoterRA. Estamos aquí para ayudarle con cualquier pregunta, 
            comentario o apoyo que pueda necesitar. No dude en comunicarse con nosotros rellenando 
            este formulario:
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                placeholder="Ingrese su nombre"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                Correo
              </label>
              <input
                type="email"
                id="email"
                placeholder="Ingrese su correo"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-lg font-medium text-gray-700 mb-2">
                Mensaje
              </label>
              <textarea
                id="message"
                rows="4"
                placeholder="Escriba un mensaje para nosotros"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Con foto
              </label>
              <div className="mt-1 flex items-center">
                <label className="cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200">
                  <span>Seleccionar archivo</span>
                  <input type="file" className="hidden" />
                </label>
                <span className="ml-4 text-sm text-gray-500">Opcional</span>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Enviar mensaje
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default IndexContactUs;