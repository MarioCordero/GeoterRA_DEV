import React from 'react';
import Fondo from "./assets/images/index-background.png";
import GeoterRA_ISO from "./assets/images/geoterra-iso-black.svg";

function IndexWelcome() {
  const bgImage = {
    backgroundImage: `url(${Fondo})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundSize: "150%",
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Capa de fondo con efectos */}
      <div 
        className="absolute inset-0"
        style={{
          ...bgImage,
          filter: "blur(4px)",
          opacity: 0.7,
        }}
      ></div>
      
      {/* Capa de luz blanca semi-transparente */}
      <div className="absolute inset-0 bg-white/30"></div>

      {/* Contenido principal (encima de las capas de fondo) */}
      <div className="relative z-10 flex flex-col justify-between p-8 text-white min-h-screen">
        {/* Logo en la parte superior */}

        {/* Contenido principal */}
        <div className="max-w-5xl mx-auto ml-7 mb-16 mt-40">
          <div className="flex items-center">
            <img src={GeoterRA_ISO} alt="GeoterRA Logo" className="h-50 m-5" />
            <h1 className="text-6xl font-bold mb-6 text-black leading-tight">Navegando el potencial geotérmico hacia un futuro renovable.</h1>
          </div>

          <div className="bg-opacity-50 p-6 mb-8 border-l-2 border-black">
            <p className="text-black w-2xl">
              GeoterRA es una aplicación web y móvil que permite visualizar puntos geográficos en un mapa interactivo.
              Su objetivo es facilitar la tarea de decisiones en proyectos de energía geotérmica mediante la consulta
              y gestión de datos geológicos validados. Los usuarios pueden registrar, editar y exportar información
              desde el mapa. Geociarilla busca apoyar el desarrollo sostenible mediante el uso eficiente de datos
              y tecnologías geoespaciales.
            </p>
          </div>

          <div className="flex">
            <button className="bg-geoterra-orange cursor-pointer text-white font-semibold py-3 px-6 rounded mr-4">
              Ver mapa
            </button>
            <button className="bg-transparent cursor-pointer text-white font-semibold py-3 px-6 rounded border border-white">
              Cómo funciona
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndexWelcome;