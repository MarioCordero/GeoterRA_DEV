import React from "react";
import '../../colorModule.css';
import '../../fontsModule.css';

export default function Footer() {
  return (
    <footer className="bg-geoterra-blue text-white p-6 poppins-light">
      <div className="max-w-6xl mx-auto space-y-2 text-center">
        <p className="m-0 text-sm md:text-base">
          © 2021 Instituto de Investigaciones en Ingeniería - Universidad de Costa Rica.
          <br className="md:hidden" />
          <span className="hidden md:inline"> </span>
          Ciudad Universitaria Rodrigo Facio 
        </p>
        <p className="m-0 text-sm md:text-base">
          San Pedro, Montes de Oca. 
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          Tel: (506) 2511-6641 (506) 2511-6642 
          <br className="md:hidden" />
          <span className="hidden md:inline"> </span>
          Fax: (506) 2224-2619 Apdo. postal: 3620-60
        </p>
        <p className="m-0 text-sm md:text-base">
          Correo electrónico: 
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          inii@ucr.ac.cr
        </p>
        <p className="m-0 text-xs md:text-sm opacity-80">
          Un Tema de SiteOrigin
        </p>
      </div>

      <style jsx="true">{`
        @media (max-width: 640px) {
          footer {
            padding: 1rem;
          }
          footer p {
            font-size: 0.875rem;
            line-height: 1.5;
            margin-bottom: 0.75rem;
          }
          footer p:last-child {
            font-size: 0.75rem;
            margin-top: 1rem;
          }
        }
        
        @media (min-width: 641px) and (max-width: 768px) {
          footer {
            padding: 1.5rem;
          }
        }
        
        @media (min-width: 769px) {
          footer p {
            font-size: 1rem;
          }
        }
      `}</style>
    </footer>
  );
}