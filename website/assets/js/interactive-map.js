function convertCoordinates(easting, northing) {
  // Define the projections
  var projFrom = "+proj=tmerc +lat_0=0 +lon_0=-84 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=WGS84 +units=m +no_defs";
  var projTo = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

  // Perform the transformation
  var [longitude, latitude] = proj4(projFrom, projTo, [easting, northing]);

  console.log(latitude, longitude);
  return [latitude, longitude]
}

function onMarkerClick() {
  let latlng = this.getLatLng(); // 'this' refers to the marker clicked
  let pointObt = this.point;

  let content = `<div id='cont'>
    <p>
        Lugar: ${pointObt.id}<br>
        Longitude: ${latlng.lng.toFixed(4)}<br>
        Latitude: ${latlng.lat.toFixed(4)}<br>
        <a id='showPoint' href='./show_point.html'>Show more</a>
    </p>
  </div>`;

  // Create a popup with the coordinates
   L.popup()
  .setLatLng(latlng)
  .setContent(content)
  .bindPopup('height= 100px')
  .openOn(map);

  console.log("AT some point")
  const toShow = document.getElementById('showPoint');

  // Crea un evento cuando se clickea el link de mostrar mas
  toShow.addEventListener('click', function(event) {
    event.preventDefault();
    console.log("Valor apunto de enviar " + pointObt.id);

    let stringPoint = JSON.stringify(pointObt);
    document.cookie = "pointObject=" + stringPoint + ";path=/;";
    window.location.href = "./show_point.html";
  });

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
        console.log(splittedResponse);
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

  for (let i = 0; i < obtainedPoints.length; i++) {
    pointXY = convertCoordinates(obtainedPoints[i].coord_x, obtainedPoints[i].coord_y)
    markers[i] = L.marker([pointXY[0],pointXY[1]]).addTo(map); 
    markers[i].point = obtainedPoints[i];
    markers[i].on('click', onMarkerClick);
    console.log(i);
  }

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
