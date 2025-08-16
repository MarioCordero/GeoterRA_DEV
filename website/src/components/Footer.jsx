import React from "react";
import '../colorModule.css';
import '../fontsModule.css';

export default function Footer() {
  return (
    <footer className="bg-geoterra-blue text-white text-sm p-6 poppins-light">
      <div className="max-w-6xl mx-auto space-y-2 text-center">
        <p className="m-0">
          © 2021 Instituto de Investigaciones en Ingeniería - Universidad de Costa Rica.
          Ciudad Universitaria Rodrigo Facio 
        </p>
        <p className="m-0">
          San Pedro, Montes de Oca. Tel: (506) 2511-6641
          (506) 2511-6642 Fax: (506) 2224-2619 Apdo. postal: 3620-60
        </p>
        <p className="m-0">
          Correo electrónico: inii@ucr.ac.cr
        </p>
        <p className="m-0">
          Un Tema de SiteOrigin
        </p>
      </div>
    </footer>
  );
}