/* initialize the map and set its view */
// setview returns a map object
var map = L.map('map').setView([51.505, -0.09], 13);

// add tile layer to the map, a Mapbox Streets tile layer
// this layer sets the URL template
/*
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'your.mapbox.project.id',
    accessToken: 'your.mapbox.public.access.token'
}).addTo(map); */

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);


// add a marker to the map
var marker = L.marker([51.5, -0.09]).addTo(map);

// add circles
var circle = L.circle([51.508, -0.11], 500, {
    color: 'green',
    fillColor: '#e03',
    fillOpacity: 0.5
}).addTo(map);

// add polygon
var polygon = L.polygon([
    [51.509, -0.09],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

// adding popups to the objects and information to them
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a silly circle.");
polygon.bindPopup("I am a polygon.");

// using popups al layers
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

var popup = L.popup();

// Events - clicling events on maps  --- e is an event objects
// .latlog return the geog location;  point returns the pixel position
function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

// method  map.on(a,b)
map.on('click', onMapClick);
