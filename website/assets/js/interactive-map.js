// Define the map and set its initial view
let map = L.map('map').setView([9.9358333333333, -84.050555555556], 17);

// Define the base layer using OpenStreetMap tiles
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    icon: false
}).addTo(map);

// Function to convert coordinates from projected to geographic
function convertCoordinates(easting, northing) {
    var projFrom = "+proj=tmerc +lat_0=0 +lon_0=-84 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=WGS84 +units=m +no_defs";
    var projTo = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
    var [longitude, latitude] = proj4(projFrom, projTo, [easting, northing]);
    return [latitude, longitude];
}

// Function to handle marker click events
function onMarkerClick() {
    let latlng = this.getLatLng();
    let pointObt = this.point;
    let content =   `<div id='cont'>
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

    const toShow = document.getElementById('showPoint');
    toShow.addEventListener('click', function(event) {

        event.preventDefault();
        let stringPoint = JSON.stringify(pointObt);
        if(document.cookie) {
            document.cookie = 'pointObject=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        document.cookie = "pointObject=" + stringPoint + ";path=/;";
        window.location.href = "./show_point.html";
    });
}

// // Function to fetch data from the server
// function fetchData() {
//     return new Promise((resolve, reject) => {
//         let region = "Guanacaste";
//         let obtainedPoints = [];
//         let xhr = new XMLHttpRequest();
//         xhr.open("POST", "assets/includes/map_data.inc.php", true);
//         xhr.send(region);

//         xhr.onreadystatechange = function () {

//             if (xhr.readyState == 4 && xhr.status == 200) {
//                 let splittedResponse = xhr.responseText.split("}");
//                 for (let i = 0; i < splittedResponse.length - 1; i++) {
//                     splittedResponse[i] += '}';
//                 }
//                 for (let i = 0; i < splittedResponse.length - 1; i++) {
//                     obtainedPoints[i] = JSON.parse(splittedResponse[i]);
//                 }
//                 resolve(obtainedPoints);
//             }
//         };

//     });
// }

// Function to query to de DB, receive the region as parameter
function fetchData(region) {
    return new Promise((resolve, reject) => {

        // Array with the queried points
        let obtainedPoints = [];
        // This object is used to interact with servers and allows you to send HTTP 
        // requests and receive responses asynchronously, without reloading the web page.
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "assets/includes/map_data.inc.php", true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        // Send a query to map_data.inc.php, asking for "region" value
        xhr.send(`region=${region}`);

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

// Variable to store the markers
let currentMarkers = [];

// Function to clean the map markers
function clearMarkers() {
    for (let marker of currentMarkers) {
      map.removeLayer(marker);
    }
    currentMarkers = [];
  }

// Function to create markers on the map
function createMarkers(obtainedPoints) {
    clearMarkers();
    for (let i = 0; i < obtainedPoints.length; i++) {
      let pointXY = convertCoordinates(obtainedPoints[i].coord_x, obtainedPoints[i].coord_y);
      let marker = L.marker([pointXY[0], pointXY[1]]).addTo(map);
      marker.point = obtainedPoints[i];
      marker.on('click', onMarkerClick);
      currentMarkers.push(marker);
    }
}

// Initialize the markes to show something at the first look at the page
fetchData("Guanacaste").then(value => createMarkers(value));

// Object to map the regions with the layers (-TODO[]: ASK TO THE DB TO CREATE A JSON OBJECT AND ADD REGIONS ACCORDING THE DB)
let regions = {
    "Guanacaste": "Guanacaste",
    "Cartago": "Cartago"
};

// Adding Layer Control
let baseLayers = {
    "Mapa Basico Costa Rica": osm,
};

let overlayLayers = {};

// Add the poits to the map according the region selected
for (let region in regions) {
    overlayLayers[region] = L.layerGroup();
    overlayLayers[region].onAdd = function() {
        fetchData(regions[region]).then(value => createMarkers(value));
    };
    overlayLayers[region].onRemove = function() {
        clearMarkers();
    };
}

L.control.layers(baseLayers, overlayLayers).addTo(map);