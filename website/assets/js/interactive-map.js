let map = L.map('map').setView([9.9358333333333, -84.050555555556], 17);

let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  icon: false
}).addTo(map);

let markers = []

markers[0] = L.marker([9.9358333333333, -84.050555555556]).addTo(map)
markers[1] = L.marker([9.9258333333333, -84.050555555556]).addTo(map)
markers[2] = L.marker([9.9458333333333, -84.050555555556]).addTo(map)
markers[3] = L.marker([9.9558333333333, -84.050555555556]).addTo(map)

function onMarkerClick() {
  var latlng = this.getLatLng(); // 'this' refers to the marker clicked
  // Create a popup with the coordinates
   L.popup()
  .setLatLng(latlng)
  .setContent("Latitude: " + latlng.lat.toFixed(4) + "<br>Longitude: " + latlng.lng.toFixed(4))
  .openOn(map);
}

for (var i = 0; i < markers.length; i++) {
  markers[i].on('click', onMarkerClick);
}


// ----------------------------------------CODE TO IMPLEMENT------------------------------------
// const L = require("leaflet");
// const connection = require("./conection");

// // Crear el mapa
// const map = L.map('map').setView([9.9358333333333, -84.050555555556], 17);

// // Capa base OSM
// const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

// // Realizar la conexión y ejecutar la consulta
// connection.connect(function(err) {
//     if (err) {
//         console.error("Error de conexión a la base de datos:", err);
//         return;
//     }
    
//     console.log("Conexión exitosa a la base de datos.");

//     // Consulta para obtener las coordenadas de los marcadores
//     const query = "SELECT latitud, longitud FROM tabla_marcadores";

//     connection.query(query, function(err, results) {
//         if (err) {
//             console.error("Error al ejecutar la consulta:", err);
//             return;
//         }

//         // Iterar sobre los resultados y crear los marcadores
//         results.forEach(function(row) {
//             const marker = L.marker([row.latitud, row.longitud]).addTo(map);
//             marker.on('click', function() {
//                 // Mostrar popup con las coordenadas
//                 L.popup()
//                 .setLatLng([row.latitud, row.longitud])
//                 .setContent("Latitude: " + row.latitud.toFixed(4) + "<br>Longitude: " + row.longitud.toFixed(4))
//                 .openOn(map);
//             });
//         });

//         // Finalizar la conexión
//         connection.end();
//     });
// });
