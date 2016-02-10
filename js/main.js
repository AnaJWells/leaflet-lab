//example of a object GeoJSON feature
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

/* initialize the map and set its view */
// setview returns a map object
var map = L.map('map').setView([51.505, -0.09], 13);

// adding the object to the map
L.geoJson(geojsonFeature).addTo(map);


// Similarly GeoJSON objects can be passed as arrays
//L.geoJson(myLines).addTo(map);
// Start with empty geojson layers and assign it to a variable
// later we can add more features
var myLayer = L.geoJson().addTo(map);
myLayer.addData(geojsonFeature);


//GeoJSON objects also can be passed as arrays
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

// style options used to pass objects
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

// The object is passed using the styles myLines and myStyle
L.geoJson(myLines, {
    style: myStyle
}).addTo(map);
