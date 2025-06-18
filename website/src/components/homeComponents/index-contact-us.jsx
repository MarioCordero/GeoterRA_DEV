import React from 'react';
import FondoContactUs from "../../assets/images/trabajo-campo2.jpeg";

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
          <form className="space-y-4">

            {/* Name Field and Email Field */}
            <div className="space-y-2 flex space-x-4">
              <div className='flex-1'>
                <h2 className="text-lg font-semibold text-geoterra-blue">Nombre</h2>
                <input
                  type="text"
                  placeholder="Ingrese su nombre"
                  className="w-full px-4 py-2 border border-geoterra-blue rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className='flex-1'>
                <h2 className="text-lg font-semibold text-geoterra-blue">Correo</h2>
                <input
                  type="email"
                  placeholder="Ingrese su correo"
                  className="w-full px-4 py-2 border border-geoterra-blue rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-geoterra-blue">Mensaje</h2>
              <textarea
                rows="4"
                placeholder="Escriba un mensaje para nosotros"
                className="w-full px-4 py-2 border border-geoterra-blue rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-1/2 m-auto! block bg-geoterra-orange hover:bg-cafe text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition duration-200"
              >
                Enviar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default IndexContactUs;
