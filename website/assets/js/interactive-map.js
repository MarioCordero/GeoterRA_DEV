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

