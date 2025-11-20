import React from 'react';
import Fondo from "../../assets/images/index-background.png";
import GeoterRA_ISO from "../../assets/images/GeoterRA-ISO-Black.svg";
import '../../fontsModule.css';

function IndexWelcome() {
  const bgImage = {
    backgroundImage: `url(${Fondo})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background layer with effects */}
      <div 
        className="absolute inset-0"
        style={{
          ...bgImage,
          filter: "blur(2px) sm:blur(3px) md:blur(4px)",
          opacity: 0.7,
        }}
      ></div>
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-red/20 sm:bg-red/25 md:bg-red/30"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen py-30 lg:py-8 lg:mx-0 sm:py-20 md:py-16 w-3/4 mx-auto">
        
        {/* Content container */}
        <div className="max-w-7xl lg:ml-24 sm:ml-4 w-full my-0 sm:my-6 md:my-8 lg:my-10 xl:my-12">

          {/* Logo and Title Section */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-8 sm:mb-12 md:mb-16">
            
            {/* Logo */}
            <div className="my-auto flex-shrink-0">
              <img 
                src={GeoterRA_ISO} 
                alt="GeoterRA Logo" 
                className="w-50 mx-auto lg:mx-0" 
              />
            </div>

            {/* Title */}
            <div className="flex-1 text-left lg:text-left">
              <h1 className="text-3xl sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-black leading-tight sm:leading-tight md:leading-tight lg:leading-tight league-spartan-bold mb-4 sm:mb-6">
                Navegando el potencial geotérmico hacia un futuro renovable.
              </h1>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto lg:mx-0">
            <div className="bg-white/30 backdrop-blur-md p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg border-l-4 border-geoterra-orange shadow-lg">
              <p className="text-black text-xs sm:text-base md:text-lg leading-relaxed poppins">
                GeoterRA es una aplicación web y móvil que permite visualizar puntos geográficos en un mapa interactivo.
                Su objetivo es facilitar la tarea de decisiones en proyectos de energía geotérmica mediante la consulta
                y gestión de datos geológicos validados. Los usuarios pueden registrar, editar y exportar información
                desde el mapa. GeoterRA busca apoyar el desarrollo sostenible mediante el uso eficiente de datos
                y tecnologías geoespaciales.
              </p>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
            <button className="bg-geoterra-orange hover:bg-orange-600 cursor-pointer text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 poppins-bold text-sm sm:text-base">
              Ver mapa
            </button>
            <button className="bg-transparent hover:bg-white hover:text-black cursor-pointer text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg border-2 border-white transition-all duration-300 transform hover:scale-105 poppins-bold text-sm sm:text-base">
              Cómo funciona
            </button>
          </div>

          {/* Optional: Scroll indicator for mobile */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 sm:hidden">
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndexWelcome;