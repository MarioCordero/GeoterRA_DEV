<script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.6.2/proj4.js"></script>

function onMarkerClick() {
  var latlng = this.getLatLng(); // 'this' refers to the marker clicked
  // Create a popup with the coordinates
   L.popup()
  .setLatLng(latlng)
  .setContent("Latitude: " + latlng.lat.toFixed(4) + "<br>Longitude: " + latlng.lng.toFixed(4))
  .openOn(map);
}

function fetchData() {
  return new Promise ((resolve, reject) => {
    let region = "Guanacaste"
    let obtainedPoints = [];
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "assets/includes/map_data.inc.php", true);
    xhr.send(region);
    xhr.onreadystatechange = function () {

      if (xhr.readyState == 4 && xhr.status == 200) {
        let splittedResponse = xhr.responseText.split("}");
        for (let i = 0; i < splittedResponse.length - 1; i++) {
          splittedResponse[i] += '}';
        }
        for (let i = 0; i < splittedResponse.length - 1; i++) {
          obtainedPoints[i] = JSON.parse(splittedResponse[i]);
        }
        resolve(obtainedPoints);
      } 
    }
  });
}

function createMarkers(obtainedPoints) {
  // markers[0] = L.marker([pointsObtained[0].coord_x, pointsObtained[0].coord_y]).addTo(map)
  let markers = []
  
  let WGS84 = proj4('EPSG:4326');
  let CRTM05 = proj4('EPSG:5367');

  var pointCRTM05 = [200000, 1000000];

  // Transform the point to WGS84 coordinates
  var pointWGS84 = proj4(CRTM05, WGS84, pointCRTM05);
  console.log(pointWGS84[0], pointWGS84[1]);

  markers[0] = L.marker([10.684953, 4.769269]).addTo(map)
  markers[1] = L.marker([9.9258333333333, -84.050555555556]).addTo(map)
  markers[2] = L.marker([9.9458333333333, -84.050555555556]).addTo(map)
  markers[3] = L.marker([9.9558333333333, -84.050555555556]).addTo(map)

  for (var i = 1; i < markers.length; i++) {
    markers[i].on('click', onMarkerClick);
  }
  // Here are the markers created

  console.log(obtainedPoints[0].id);
  console.log(obtainedPoints[1].id);
  console.log(obtainedPoints[2].id);
  console.log(obtainedPoints);
}


// No se ordenar .JS Mario ayuda lo de arriba son solo funciones


let map = L.map('map').setView([9.9358333333333, -84.050555555556], 17);

let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  icon: false
}).addTo(map);

fetchData().then(value => createMarkers(value));



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
