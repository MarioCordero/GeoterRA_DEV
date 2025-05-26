import React from 'react';
import GeoterRA_LOGO_White from '../assets/images/GeoterRA-Logo-White.svg'; // Asegúrate de que la ruta sea correcta

function IndexAboutUs() {
  return (
    <div className="bg-black px-44 py-44 relative">
      {/* Background Image */}
      <div
        className="absolute top-0 right-0 w-1/2 h-1/2 bg-cover bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${GeoterRA_LOGO_White})` }}
      ></div>

      <div className="text-6xl font-bold text-white mb-12 text-left">
        <h1>Acerca de nosotros</h1>
        <div className="mt-5 bottom-0 left-0 w-1/4 border-b-4 border-white"></div>
      </div>
        
      <div className="p-8 rounded-lg shadow-xl flex flex-col lg:flex-row gap-24">
        {/* Column 1 */}
        <div className="flex-1">
          <p className="text-lg text-white mb-6 leading-relaxed">
            GeoterRA es una aplicación innovadora diseñada para optimizar la toma de decisiones 
            en proyectos que aprovechan la energía geotérmica en el territorio nacional. Nuestra 
            misión es proporcionar información geológica precisa y validada para inversores y 
            desarrolladores, minimizando riesgos y maximizando la eficiencia en la planificación y 
            ejecución de actividades económicas sostenibles. Con un equipo multidisciplinario de 
            expertos en geología y tecnologías de la información, nos comprometemos a fomentar el 
            uso de energías renovables y contribuir al desarrollo sostenible del país a través de 
            herramientas interactivas y datos actualizados.
          </p>
        </div>

        {/* Arrow Icon */}
        <div className="flex justify-center items-center my-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </div>

        {/* Vertical Line */}
        <div className="flex justify-center items-center my-4">
          <div className="w-1 h-1/2 bg-white"></div> {/* Line added here */}
        </div>

        {/* Column 2 */}
        <div className="flex-1 border-t pt-6 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-6">
          <p className="text-lg text-white leading-relaxed">
            Desde su concepción, GeoterRA ha sido impulsada por la necesidad crítica de contar con 
            información especializada y esencial para aquellos que deseen invertir en la geotermia. 
            Utilizando avanzadas tecnologías de visualización y análisis de datos, nuestra plataforma 
            ofrece una vista integral y detallada del potencial geotérmico en diversas regiones. Esto 
            permite a los usuarios realizar una planificación estratégica informada, reduciendo riesgos 
            y aumentando las posibilidades de éxito en sus proyectos. Nos enorgullece ser una herramienta 
            clave en la promoción de una transición energética hacia fuentes más limpias y sostenibles.
          </p>
        </div>
      </div>
    </div>
  );
}

export default IndexAboutUs;