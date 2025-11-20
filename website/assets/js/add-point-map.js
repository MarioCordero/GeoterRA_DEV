// Inicializa el mapa
var map = L.map('add-point-map').setView([9.936603897552947, -84.0442299188895], 20); // Ajusta el nivel de zoom aquí

// Añade la capa de mapa (usando OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Function to center the map on the user's location and update the coordinates
function centerMapOnUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                
                // Center the map and add a marker on the user's location
                map.setView([latitude, longitude], 17);
                if (marker) {
                    marker.setLatLng([latitude, longitude]);
                } else {
                    marker = L.marker([latitude, longitude]).addTo(map)
                        .bindPopup('Ubicación actual')
                        .openPopup();
                }
                
                // Update the input fields with the user's location
                updateCoordinates({ lat: latitude, lng: longitude });
            },
            error => {
                // console.error("Error al obtener la ubicación del usuario:", error);
                alert("No se pudo obtener la ubicación.");
            }
        );
    } else {
        alert("La geolocalización no es compatible con este navegador.");
    }
}

// Add a custom button to the map to trigger the centering function
let locationButton = L.control({ position: 'bottomright' });
locationButton.onAdd = function() {
    let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    div.innerHTML = '📍'; // Button icon
    div.style.width = '30px';
    div.style.height = '30px';
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

// Inicializa el marcador en el centro del mapa
var marker;

// Función para actualizar el marcador y los campos de coordenadas
function updateMarker(lat, lng) {
    if (!marker) {
        marker = L.marker([lat, lng]).addTo(map);
    } else {
        marker.setLatLng([lat, lng]);
    }
    map.setView([lat, lng], 20); // Opcional: centra el mapa en el nuevo marcador

    // Actualiza los campos de latitud y longitud
    updateCoordinates({ lat: lat, lng: lng });
}

// Función para actualizar los campos de coordenadas
function updateCoordinates(latlng) {
    document.getElementById('lat').value = latlng.lat;
    document.getElementById('lng').value = latlng.lng;
    document.getElementById('hiddenLat').value = latlng.lat;
    document.getElementById('hiddenLng').value = latlng.lng;
}

// Función para verificar si los inputs están vacíos y eliminar el marcador
function checkInputsAndRemoveMarker() {
    var lat = document.getElementById('lat').value.trim();
    var lng = document.getElementById('lng').value.trim();

    if (lat === "" || lng === "") {
        if (marker) {
            map.removeLayer(marker);  // Elimina el marcador del mapa
            marker = null;  // Resetea el marcador
        }
    }
}

// Evento para actualizar el marcador cuando se hace clic en el mapa
map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    updateMarker(lat, lng);
});

// Evento para actualizar los campos cuando se mueve el marcador
if (marker) {
    marker.on('moveend', function() {
        var latlng = marker.getLatLng();
        updateCoordinates(latlng);
    });
}

// Evento para actualizar el marcador y verificar inputs cuando se ingresan coordenadas
document.getElementById('lat').addEventListener('input', function() {
    var lat = parseFloat(document.getElementById('lat').value);
    var lng = parseFloat(document.getElementById('lng').value);

    if (!isNaN(lat) && !isNaN(lng)) {
        updateMarker(lat, lng);
    }
    checkInputsAndRemoveMarker();
});

document.getElementById('lng').addEventListener('input', function() {
    var lat = parseFloat(document.getElementById('lat').value);
    var lng = parseFloat(document.getElementById('lng').value);

    if (!isNaN(lat) && !isNaN(lng)) {
        updateMarker(lat, lng);
    }
    checkInputsAndRemoveMarker();
});
