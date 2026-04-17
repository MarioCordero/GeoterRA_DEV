import React from 'react';
import GeoterRA_ISO_Black from "../../assets/images/GeoterRA-ISO-Black.svg";
import GeoterRA_LOGO_Color from "../../assets/images/GeoterRA-Logo-Color.svg";
import '../../fontsModule.css';

function IndexHowWorks() {
  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50 min-h-screen">
      
      {/* Background Image */}
      <div className="absolute bottom-0 left-0 w-full h-full z-0 overflow-hidden opacity-5 sm:opacity-10 md:opacity-15">
        <img
          src={GeoterRA_LOGO_Color}
          alt="Background"
          className="absolute w-full sm:w-[150%] md:w-[200%] h-auto"
          style={{
            left: "0%",
            transform: "translateX(-25%)",
            bottom: "0"
          }}
        />
      </div>
      
      <div className="relative mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl">
        
        {/* Section header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black poppins-bold">
            Cómo funciona
          </h1>
          <div className="mt-4 sm:mt-6 w-20 sm:w-24 md:w-32 border-b-2 sm:border-b-3 md:border-b-4 border-black mx-auto"></div>
        </div>

        {/* Logo Section - Centered on small screens, hidden on large */}
        <div className="flex justify-center p-4 mb-8">
          <img 
            src={GeoterRA_ISO_Black} 
            alt="GeoterRA Logo" 
            className="w-32 sm:w-40 h-auto"
          />
        </div>

        {/* Small Screens Layout - Vertical Column Flow */}
        <div className="lg:hidden space-y-8">
          
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center mb-3">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
              <h3 className="text-lg sm:text-xl font-semibold text-black poppins-bold">Recolección de datos</h3>
            </div>
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed poppins">
              GeoterRA comienza con la recolección integral de datos geológicos de diversas 
              fuentes. Expertos realizan estudios de campo para obtener información esencial, 
              mientras que los usuarios contribuyen subiendo fotos y datos geolocalizados a 
              través de nuestra aplicación móvil.
            </p>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-gray-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center mb-3">
              <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
              <h3 className="text-lg sm:text-xl font-semibold text-black poppins-bold">Validación y almacenamiento</h3>
            </div>
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed poppins">
              Una vez recopilados, los datos pasan por un riguroso proceso de validación y análisis 
              especializado para asegurar su precisión. Estos datos se almacenan en una base de datos 
              SQL, lo que permite un manejo eficiente y estructurado de la información.
            </p>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-gray-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center mb-3">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
              <h3 className="text-lg sm:text-xl font-semibold text-black poppins-bold">Herramientas avanzadas</h3>
            </div>
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed poppins">
              GeoterRA proporciona herramientas avanzadas para la planificación y evaluación de 
              proyectos. Los usuarios pueden interactuar con el mapa, buscar y filtrar información 
              geológica específica, y visualizar estructuras en 3D.
            </p>
          </div>
        </div>

        {/* Large Screens Layout - Horizontal Row Flow */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-8 xl:gap-12">
          
          {/* Step 1 */}
          <div className="flex-1 relative">
            <div className="bg-white p-6 xl:p-8 rounded-lg shadow-md border-t-4 border-blue-500">
              <div className="flex flex-col items-center text-center">
                <span className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">1</span>
                <h3 className="text-lg xl:text-xl font-semibold text-black poppins-bold mb-4">Recolección de datos</h3>
                <p className="text-gray-800 text-sm xl:text-base leading-relaxed poppins">
                  GeoterRA comienza con la recolección integral de datos geológicos de diversas 
                  fuentes. Expertos realizan estudios de campo para obtener información esencial.
                </p>
              </div>
            </div>
            
            {/* Arrow Right */}
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex-1 relative">
            <div className="bg-white p-6 xl:p-8 rounded-lg shadow-md border-t-4 border-green-500">
              <div className="flex flex-col items-center text-center">
                <span className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">2</span>
                <h3 className="text-lg xl:text-xl font-semibold text-black poppins-bold mb-4">Validación y almacenamiento</h3>
                <p className="text-gray-800 text-sm xl:text-base leading-relaxed poppins">
                  Los datos pasan por un riguroso proceso de validación y se almacenan en una base de datos 
                  SQL para un manejo eficiente y estructurado.
                </p>
              </div>
            </div>
            
            {/* Arrow Right */}
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex-1">
            <div className="bg-white p-6 xl:p-8 rounded-lg shadow-md border-t-4 border-orange-500">
              <div className="flex flex-col items-center text-center">
                <span className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">3</span>
                <h3 className="text-lg xl:text-xl font-semibold text-black poppins-bold mb-4">Herramientas avanzadas</h3>
                <p className="text-gray-800 text-sm xl:text-base leading-relaxed poppins">
                  Proporcionamos herramientas avanzadas para la planificación y evaluación de 
                  proyectos con visualización 3D y mapas interactivos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndexHowWorks;