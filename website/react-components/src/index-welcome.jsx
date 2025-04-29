import React from 'react';
import Fondo from "./assets/images/index-background.png";
import GeoterRA_ISO from "./assets/images/geoterra-iso-black.svg";

function IndexWelcome() {
  const bgImage = {
    backgroundImage: `url(${Fondo})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover"
  };
  
  return (
    <div style={bgImage} className="min-h-screen flex flex-col justify-between p-8 text-white">
      {/* Logo en la parte superior */}
      <div className="flex justify-start">
        <img src={GeoterRA_ISO} alt="GeoterRA Logo" className="h-16"/>
      </div>

      {/* Contenido principal */}
      <div className="max-w-2xl mb-16">
        <h1 className="text-4xl font-bold mb-6">Navegando el potencial geotérmico hacia un futuro renovable.</h1>
        
        <div className="bg-black bg-opacity-50 p-6 rounded-lg mb-8">
          <p className="text-lg">
            Geociarilla es una aplicación web y móvil que permite visualizar puntos geográficos en un mapa interactivo. 
            Su objetivo es facilitar la tarea de decisiones en proyectos de energía geotérmica mediante la consulta 
            y gestión de datos geológicos validados. Los usuarios pueden registrar, editar y exportar información 
            desde el mapa. Geociarilla busca apoyar el desarrollo sostenible mediante el uso eficiente de datos 
            y tecnologías geoespaciales.
          </p>
        </div>

        <div className="flex">
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded mr-4">
            Ver mapa
          </button>
          <button className="bg-transparent hover:bg-white hover:bg-opacity-20 text-white font-semibold py-3 px-6 rounded border border-white">
            Cómo funciona
          </button>
        </div>
      </div>

      {/* Línea divisoria y texto inferior (opcional) */}
      <div className="border-t border-white border-opacity-30 pt-4">
        {/* Puedes añadir contenido adicional aquí si lo necesitas */}
      </div>
    </div>
  );
}

export default IndexWelcome;