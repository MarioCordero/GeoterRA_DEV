import React from 'react';
import Fondo from "./assets/images/index-background.png";

function IndexWelcome() {
    const bgImage = {
        backgroundImage: `url(${Fondo})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top"
    }
  return (
    <div style={bgImage} className="overflow-hidden min-h-screen ">

      <h1>Navegando el potencial geotérmico hacia un futuro renovable.</h1>
      <p>GeoterRA es una aplicación web y móvil que permite visualizar puntos 
        geográficos en un mapa interactivo. Su objetivo es facilitar la toma de 
        decisiones en proyectos de energía geotérmica mediante la consulta y gestión 
        de datos geológicos validados. Los usuarios pueden registrar, editar y 
        exportar información desde el mapa. GeoterRA busca apoyar el desarrollo 
        sostenible mediante el uso eficiente de datos y tecnologías geoespaciales.</p>

        <button className="bg-blue-600">Cómo funciona</button>
        <button className="ml-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">
        Ver mapa
        </button>

    </div>
  );
}

export default IndexWelcome;