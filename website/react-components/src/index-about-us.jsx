import React from 'react';

function IndexAboutUs() {
  return (
    <div className="pt-40 pb-40 bg-black">
        <div className="text-4xl font-bold text-white mb-8 text-left">
            <h1>Acerca de nosotros</h1>
        </div>
        
        <div className="bg-blanco p-8 rounded-lg shadow-lg">
          <p className="text-lg text-negro mb-6">
            <span className="font-bold text-azul">GecieR&</span> es una aplicación innovadora diseñada para optimizar la toma de decisiones en proyectos que aprovechan la energía geotérmica en el territorio nacional. Nuestro matrón es proporcionar información geológica precisa y validada para inversores y desarrolladores, minimizando riesgos y maximizando lo eficiencia en la planificación y ejecución de actividades económicas sostenibles.
          </p>
          
          <p className="text-lg text-negro mb-6">
            Con un equipo multidisciplinario de expertos en geología y tecnologías de la información, nos comprometemos a fomentar el uso de energías renovables y contribuir al desarrollo sostenible del país o través de herramientas interactivas y datos actualizados.
          </p>
          
          <div className="border-t border-grisOscuro pt-6 mt-6">
            <p className="text-lg text-negro mb-6">
              Desde su concepción, <span className="font-bold text-azul">GecieR&</span> ha sido impulsada por la necesidad crítica de contar con información especializada y esencial para aquellos que deseen invertir en la geotérmica. Utilizando anonoxales tecnologías de visualización y análisis de datos, nuestra plataforma ofrece una vista integral y detallada del potencial geotérmico en diversas regiones.
            </p>
            
            <p className="text-lg text-negro">
              Esto permite a los usuarios realizar una planificación estratégica informada, reduciendo riesgos y aumentando las posibilidades de éxito en sus proyectos. Nos arreglíficos ser una herramienta clave en la promoción de una transición energética hacia fuentes más limpias y sostenibles.
            </p>
          </div>
        </div>
    </div>
  );
}

export default IndexAboutUs;