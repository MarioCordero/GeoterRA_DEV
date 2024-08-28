    // Inicializa el mapa
    var map = L.map('add-point-map').setView([9.7489, -83.7534], 7); // Coordenadas iniciales (Costa Rica)

    // Añade la capa de mapa (usando OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    var marker;

    function updateMarker(lat, lng) {
        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng]).addTo(map);
        }
        map.setView([lat, lng], 13); // Opcional: centra el mapa en el nuevo marcador
    }

    // Evento para actualizar el marcador cuando se ingresan coordenadas
    document.getElementById('lat').addEventListener('input', function() {
        var lat = parseFloat(document.getElementById('lat').value);
        var lng = parseFloat(document.getElementById('lng').value);

        if (!isNaN(lat) && !isNaN(lng)) {
            updateMarker(lat, lng);
            
            // Actualiza los campos ocultos para el formulario
            document.getElementById('hiddenLat').value = lat;
            document.getElementById('hiddenLng').value = lng;
        }
    });

    document.getElementById('lng').addEventListener('input', function() {
        var lat = parseFloat(document.getElementById('lat').value);
        var lng = parseFloat(document.getElementById('lng').value);

        if (!isNaN(lat) && !isNaN(lng)) {
            updateMarker(lat, lng);
            
            // Actualiza los campos ocultos para el formulario
            document.getElementById('hiddenLat').value = lat;
            document.getElementById('hiddenLng').value = lng;
        }
    });