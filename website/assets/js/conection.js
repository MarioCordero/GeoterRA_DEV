let mysql = require("mysql");

// Mario cfg
let conection = mysql.createConnection({
    host: "localhost",
    database: "GeoterRA",
    user: "mario",
    password: "2003"
});

// General cfg
// let conection = mysql.createConection({
//     host: "localhost",
//     database: "GeoterRA",
//     user: "root",
//     password: ""
// });

// Prueba de conexión
conection.connect(function(errConectionDB){

    if(errConectionDB){
        throw errConectionDB;
    }else{
        console.log("Conexion exitosa!");
    }

});

// Exportar la conexión para que pueda ser utilizada en otros módulos, redcordar cerrar la configuracion donde sea llamada en JS
module.exports = conection;

// Finalizar la conexion, para que no quede en memoria RAM
// conection.end();