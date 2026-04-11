import React, {useState} from 'react';
import FondoContactUs from "../../assets/images/trabajo-campo2.jpeg";
import NotImplementedModal from '../common/NotImplementedModal';
import '../../fontsModule.css';


function IndexContactUs() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-gray-50 min-h-screen">
      
      {/* Background Layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${FondoContactUs})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px) sm:blur(6px md:blur(8px)",
          opacity: 0.4,
          zIndex: 0,
        }}
      ></div>

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/10 sm:bg-black/15 md:bg-black/20 z-5"></div>

      {/* Content */}
      <div className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-black mb-3 sm:mb-4 md:mb-6 poppins-bold leading-tight">
            Contactá con nosotros
          </h1>
          <div className="w-16 sm:w-20 md:w-24 lg:w-32 border-b-2 sm:border-b-3 md:border-b-4 border-black mb-4 sm:mb-6 mx-auto lg:mx-0"></div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-black poppins leading-relaxed max-w-3xl mx-auto lg:mx-0">
            Gracias por su interés en GeoterRA. Estamos aquí para ayudarle con cualquier pregunta, 
            comentario o apoyo que pueda necesitar. No dude en comunicarse con nosotros rellenando 
            este formulario:
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 rounded-lg shadow-xl border border-white/20 poppins">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">

            {/* Name and Email Fields */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              
              {/* Name Field */}
              <div className="flex-1">
                <label htmlFor="name" className="block text-sm sm:text-base md:text-lg font-semibold text-geoterra-blue mb-2">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ingrese su nombre"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-geoterra-blue rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  required
                />
              </div>
              
              {/* Email Field */}
              <div className="flex-1">
                <label htmlFor="email" className="block text-sm sm:text-base md:text-lg font-semibold text-geoterra-blue mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Ingrese su correo"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-geoterra-blue rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Subject Field - Optional */}
            <div className="hidden md:block">
              <label htmlFor="subject" className="block text-sm md:text-base lg:text-lg font-semibold text-geoterra-blue mb-2">
                Asunto
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Asunto del mensaje"
                className="w-full px-4 py-3 border border-geoterra-blue rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent transition-all duration-200 text-sm md:text-base"
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm sm:text-base md:text-lg font-semibold text-geoterra-blue mb-2">
                Mensaje
              </label>
              <textarea
                id="message"
                rows="4"
                placeholder="Escriba un mensaje para nosotros"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-geoterra-blue rounded-md focus:outline-none focus:ring-2 focus:ring-geoterra-blue focus:border-transparent resize-vertical min-h-[100px] sm:min-h-[120px] md:min-h-[140px] transition-all duration-200 text-sm sm:text-base"
                required
              ></textarea>
            </div>

            {/* Privacy Notice - Mobile */}
            <div className="md:hidden text-xs text-gray-600 leading-relaxed">
              Al enviar este formulario, acepta que procesemos su información de acuerdo con nuestra política de privacidad.
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                className="w-full sm:w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 mx-auto block bg-geoterra-orange hover:bg-orange-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-md cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-sm sm:text-base md:text-lg poppins-bold"
              >
                Enviar Mensaje
              </button>
            </div>

            {/* Privacy Notice - Desktop */}
            <div className="hidden md:block text-sm text-gray-600 text-center leading-relaxed pt-4">
              Al enviar este formulario, acepta que procesemos su información de acuerdo con nuestra 
              <span className="text-geoterra-blue cursor-pointer hover:underline"> política de privacidad</span>.
            </div>

          </form>
        </div>

        {/* Contact Info - Desktop Only */}
        <div className="hidden lg:flex justify-center gap-8 xl:gap-12 mt-8 xl:mt-12">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-geoterra-blue mb-2">Email</h3>
              <p className="text-sm text-gray-700">contacto@geoterra.com</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-geoterra-blue mb-2">Teléfono</h3>
              <p className="text-sm text-gray-700">+506 (XXX) XXX-XXXX</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-geoterra-blue mb-2">Ubicación</h3>
              <p className="text-sm text-gray-700">Costa Rica</p>
            </div>
          </div>
        </div>
      </div>
      <NotImplementedModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}

export default IndexContactUs;