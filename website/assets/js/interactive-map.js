// Define the map and set its initial view
let map = L.map('map').setView([9.9358333333333, -84.050555555556], 17);

// Define the base layer using OpenStreetMap tiles
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    icon: false
}).addTo(map);

// Function to center the map on the user's location
function centerMapOnUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 17); // Center the map with a zoom level of 17
            L.marker([latitude, longitude]).addTo(map)
                .bindPopup('Ubicación actual')
                .openPopup();
        }, error => {
            console.error("Error al obtener la ubicación del usuario:", error);
            alert("No se pudo obtener la ubicación.");
        });
    } else {
        alert("La geolocalización no es compatible con este navegador.");
    }
}

// Add a custom button to the map to trigger the centering function
let locationButton = L.control({ position: 'bottomright' });
locationButton.onAdd = function() {
    let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    div.innerHTML = '📍'; // Button icon
    div.style.width = '50px';
    div.style.height = '50px';
    div.style.cursor = 'pointer';
    div.style.backgroundColor = 'white';
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.title = 'Centrar en la ubicación del usuario';
    div.onclick = centerMapOnUserLocation;
    return div;
};
locationButton.addTo(map);

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
                            <a id='showPoint' href='./show_point.php'>Show more</a>
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
    const toShow = document.getElementById('showPoint');
    toShow.addEventListener('click', function(event) {

        event.preventDefault();
        let stringPoint = JSON.stringify(pointObt);
        if(document.cookie) {
            document.cookie = 'pointObject=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        document.cookie = "pointObject=" + stringPoint + ";path=/;";
        window.location.href = "./show-point.php";
    });
}

// Function to clean th map markers
function clearMarkers(){
    for (let region in regionMarkers) {
        regionMarkers[region].forEach(marker => {
            map.removeLayer(marker);
        });
    }
}

// Function to query to de DB, receive the region as parameter
function fetchData(region) {
    return new Promise((resolve, reject) => {

        // Array with the queried points
        let obtainedPoints = [];
        // This object is used to interact with servers and allows you to send HTTP 
        // requests and receive responses asynchronously, without reloading the web page.
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "../../../API/map_data.inc.php", true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        // Send a query to map_data.inc., asking for "region" value
        xhr.send(`region=${region}`);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let splittedResponse = xhr.responseText.split("}");

                for (let i = 0; i < splittedResponse.length - 1; i++) {
                    splittedResponse[i] += '}';
                }
                for (let i = 0; i < splittedResponse.length - 1; i++) {
                    obtainedPoints[i] = JSON.parse(splittedResponse[i].slice(1));
                }
                resolve(obtainedPoints);

                // Add region to regionActive if not already present
                if (!regionActive.includes(region)) {
                    regionActive.push(region);
                }
            }
        };
    });
}

// A array to track the active layers
let regionActive = [];

// Variable to store the markers of each region
let regionMarkers = {
    "Guanacaste": [],
    "Cartago": []
};

// Function to create markers on the map
function createMarkers(region, obtainedPoints) {
    for (let i = 0; i < obtainedPoints.length; i++) {
        let pointXY = convertCoordinates(obtainedPoints[i].coord_x, obtainedPoints[i].coord_y);
        let marker = L.marker([pointXY[0], pointXY[1]]).addTo(map);
        marker.point = obtainedPoints[i];
        marker.on('click', onMarkerClick);
        regionMarkers[region].push(marker);
    }
}

// Initialize the markers to show something at the first look at the page
fetchData("Guanacaste").then(value => {
    createMarkers("Guanacaste", value);
    // Add the layer to the map
    overlayLayers["Guanacaste"].addTo(map);
});

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

// Add the points to the map according to the region selected
for (let region in regions) {

    // Create a new group of layers in base of the object declared in "regions"
    overlayLayers[region] = L.layerGroup();

    // onAdd event, when the layer is checked
    overlayLayers[region].onAdd = function() {
        // Cuando se añade la capa al mapa, se realiza lo siguiente:
        fetchData(regions[region]).then(value => createMarkers(regions[region], value));

        
        // Add region to regionActive if not already present
        if (!regionActive.includes(region)) {
            regionActive.push(region);
        }

        // Update the markers on the map
        updateMarkers();

        console.log(regionActive);
    };

    // onRemove event, when the layer is unchecked
    overlayLayers[region].onRemove = function() {

        
        // The index of the region unckecked
        let index = regionActive.indexOf(region);
        
        // Verify if the region exists
        if (index !== -1) {
            regionActive.splice(index, 1);
        }

        // Update the markers on the map
        updateMarkers();

        console.log(regionActive);
    };
}

// Function that update the markers shown on the map
function updateMarkers() {

    // Erase all the markers
    clearMarkers();

    // Add the active layers markers
    for (let region of regionActive) {
        // Get the points for the region from the DB
        fetchData(regions[region]).then(value => {

            // Create markers for the region obtained
            createMarkers(region, value);

            // Add the region to the control if it isn't added yet
            if (!map.hasLayer(overlayLayers[region])) {
                overlayLayers[region].addTo(map);
            }
        });
    }
}

// CUSTOM STYLES FOR THE CONTROLS (-TODO[])
document.addEventListener('DOMContentLoaded', (event) => {
    // Crear un nuevo elemento h1
    let h1 = document.createElement('h1');
    // Añadirle texto
    h1.textContent = 'Mapas disponibles';
    h1.style.margin = "0 0 10px 0";  // Estilo opcional

    // Seleccionar el elemento donde quieres insertar el h1
    let mapDiv = document.querySelector('.leaflet-control-layers-base');

    // Insertar el h1 como el primer hijo del div
    mapDiv.insertBefore(h1, mapDiv.firstChild);
});

document.addEventListener('DOMContentLoaded', (event) => {
    // Crear un nuevo elemento h1
    let h1 = document.createElement('h1');
    // Añadirle texto
    h1.textContent = 'Regiones disponibles';
    h1.style.margin = "0 0 10px 0";  // Estilo opcional

    // Seleccionar el elemento donde quieres insertar el h1
    let mapDiv = document.querySelector('.leaflet-control-layers-overlays');

    // Insertar el h1 como el primer hijo del div
    mapDiv.insertBefore(h1, mapDiv.firstChild);
});


// The controls icon can be modified: https://www.youtube.com/watch?v=edeUsKlxQfw&list=PLaaTcPGicjqgLAUhR_grKBGCXbyKaP7qR&index=60

// Function to get the currently active regions
function getActiveRegions() {
    return regionActive;
}

L.control.layers(baseLayers, overlayLayers).addTo(map);
