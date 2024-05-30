// Define the map and set its initial view
let map = L.map('map').setView([9.9358333333333, -84.050555555556], 17);

// Define the base layer using OpenStreetMap tiles
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  icon: false
}).addTo(map);

// Define another base layer using Mapbox Satellite
let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token=YOUR_MAPBOX_ACCESS_TOKEN', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  tileSize: 512,
  zoomOffset: -1
});

// Function to convert coordinates from projected to geographic
function convertCoordinates(easting, northing) {
  var projFrom = "+proj=tmerc +lat_0=0 +lon_0=-84 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=WGS84 +units=m +no_defs";
  var projTo = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
  var [longitude, latitude] = proj4(projFrom, projTo, [easting, northing]);
  return [latitude, longitude];
}

// Function to handle marker click events
function onMarkerClick() {
  // Deletes previous cookies from pointObject
  
  let latlng = this.getLatLng();
  let pointObt = this.point;
  let content = `<div id='cont'>
    <p>
        Lugar: ${pointObt.id}<br>
        Longitude: ${latlng.lng.toFixed(4)}<br>
        Latitude: ${latlng.lat.toFixed(4)}<br>
        <a id='showPoint' href='./show_point.html'>Show more</a>
    </p>
  </div>`;

  L.popup()
    .setLatLng(latlng)
    .setContent(content)
    .bindPopup('height= 100px')
    .openOn(map);

  // Save the point clicked into the storage
  let pointStr = JSON.stringify(pointObt)
  localStorage.setItem("pointObject", pointStr);
}

// Function to fetch data from the server
function fetchData() {
  return new Promise((resolve, reject) => {
    let region = "Guanacaste";
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
    };
  });
}

// Function to create markers on the map
function createMarkers(obtainedPoints) {
  let markers = [];
  for (let i = 0; i < obtainedPoints.length; i++) {
    let pointXY = convertCoordinates(obtainedPoints[i].coord_x, obtainedPoints[i].coord_y);
    markers[i] = L.marker([pointXY[0], pointXY[1]]).addTo(map);
    markers[i].point = obtainedPoints[i];
    markers[i].on('click', onMarkerClick);
  }
}

// Fetch data and create markers on the map
fetchData().then(value => createMarkers(value));

// Adding Layer Control
let baseLayers = {
  "OpenStreetMap": osm,
  "Limón": satellite,
  "Guancaste": satellite,
  "San Jose": satellite,
  "Alajuela": satellite
};

let overlayLayers = {
  // Add any overlay layers you want here, for example:
  // "Layer Name": someLeafletLayer
};

L.control.layers(baseLayers, overlayLayers).addTo(map);
