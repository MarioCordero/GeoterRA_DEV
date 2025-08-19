import React from 'react';
import GeoterRA_LOGO_White from '../../assets/images/GeoterRA-Logo-White.svg';
import '../../fontsModule.css';

function IndexAboutUs() {
  return (
    <div className="bg-black px-4 sm:px-8 md:px-16 lg:px-32 xl:px-44 py-16 sm:py-24 md:py-32 lg:py-44 relative">
      {/* Background Image */}
      <div
        className="absolute top-0 right-0 w-1/3 sm:w-1/2 h-1/3 sm:h-1/2 bg-cover bg-no-repeat opacity-10 sm:opacity-20"
        style={{ backgroundImage: `url(${GeoterRA_LOGO_White})` }}
      ></div>

      {/* Title Section */}
      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 sm:mb-12 text-left poppins-bold relative z-10">
        <h1>Acerca de nosotros</h1>
        <div className="mt-3 sm:mt-5 w-1/2 sm:w-1/3 md:w-1/4 border-b-2 sm:border-b-4 border-white"></div>
      </div>
        
      {/* Content Section */}
      <div className="p-4 sm:p-6 md:p-8 rounded-lg shadow-xl flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16 lg:gap-24 poppins-light text-sm sm:text-base relative z-10">
        {/* Column 1 */}
        <div className="flex-1">
          <p className="text-white mb-6 leading-relaxed">
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

        {/* Separator - Arrow for mobile, Line for desktop */}
        <div className="flex justify-center items-center my-4 lg:my-0">
          {/* Arrow Icon - visible on mobile */}
          <svg className="w-6 h-6 text-white lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          
          {/* Vertical Line - visible on desktop */}
          <div className="hidden lg:block w-1 h-32 bg-white opacity-50"></div>
        </div>

        {/* Column 2 */}
        <div className="flex-1 border-t pt-6 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-6 lg:border-white lg:border-opacity-30">
          <p className="text-white leading-relaxed">
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