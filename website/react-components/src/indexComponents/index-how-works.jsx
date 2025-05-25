import React from 'react';
import GeoterRA_ISO_Black from "../assets/images/GeoterRA-ISO-Black.svg";
import GeoterRA_LOGO_Color from "../assets/images/GeoterRA-Logo-Color.svg";

function IndexHowWorks() {
  return (
    <div className="relative py-24 bg-gray-50 min-h-[90vh]">

    {/* Background Image */}
    <div className="absolute bottom-0 left-0 w-full h-full z-0 overflow-hidden opacity-15">
      <img
        src={GeoterRA_LOGO_Color}
        alt="Background"
        className="absolute"
        style={{
          width: "200%", // Makes the image twice as wide as its container
          height: "auto", // Maintains the aspect ratio
          left: "-50%", // Moves the image 50% to the left
          bottom: "0", // Aligns the image to the bottom of the container
        }}
      />
    </div>
      
      <div className="relative mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-30">
          <h1 className="text-6xl font-bold text-black">Cómo funciona</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-20 mr-24 ml-14">

            {/* Left column - Logo/image */}
            <div className="md:flex items-center justify-center p-4 w-full">
              <img 
                src={GeoterRA_ISO_Black} 
                alt="GeoteíRA Logo" 
                className="w-full h-auto"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-black mb-3">Recolección de datos</h3>
              <p className="text-gray-600 leading-relaxed">
                GeoterRA comienza con la recolección integral de datos geológicos de diversas 
                fuentes. Expertos realizan estudios de campo para obtener información esencial, 
                mientras que los usuarios contribuyen subiendo fotos y datos geolocalizados a 
                través de nuestra aplicación móvil. Además, integramos datos de bases de datos 
                geológicas existentes para asegurar una recopilación rica y diversa.
              </p>
            </div>

            {/* Vertical Line with Arrow */}
            <div className="flex flex-col items-center my-4">
              {/* Arrow */}
              <svg
                className="w-6 h-6 text-black mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {/* Vertical Line */}
              <div className="w-1 h-3/4 bg-black"></div> {/* Adjust height as needed */}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-black mb-3">Validación y almacenamiento</h3>
              <p className="text-gray-600 leading-relaxed">
                Una vez recopilados, los datos pasan por un riguroso proceso de validación y análisis 
                especializado para asegurar su precisión. Estos datos se almacenan en una base de datos 
                SQL, lo que permite un manejo eficiente y estructurado de la información. Utilizando 
                Leaflet y OpenStreetMap, ofrecemos un mapa interactivo personalizado donde los usuarios 
                pueden explorar y visualizar la información geológica detallada.
              </p>
            </div>

            {/* Vertical Line with Arrow */}
            <div className="flex flex-col items-center my-4">
              {/* Vertical Line */}
              <div className="w-1 h-3/4 bg-black"></div> {/* Adjust height as needed */}
              {/* Arrow */}
              <svg
                className="w-6 h-6 text-black mt-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            

            <div>
              <h3 className="text-xl font-semibold text-black mb-3">Herramientas avanzadas</h3>
              <p className="text-gray-600 leading-relaxed">
                GeoterRA proporciona herramientas avanzadas para la planificación y evaluación de 
                proyectos. Los usuarios pueden interactuar con el mapa, buscar y filtrar información 
                geológica específica, y visualizar estructuras en 3D. Un robusto sistema de 
                autenticación garantiza la seguridad de los datos. La plataforma se actualiza 
                regularmente con nuevos datos y permite la contribución de la comunidad, 
                fomentando un entorno colaborativo y siempre actualizado.
              </p>
            </div>

        </div>
      </div>
    </div>
  );
}

export default IndexHowWorks;