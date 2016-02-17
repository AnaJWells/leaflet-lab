/* initialize the map and set its view */

//function to instantiate the Leaflet map
function createMap(){
    //Initialize the map and set its view
    var map = L.map('map').setView([20, 0], 2);

    //add OSM base tilelayer
    //L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
	  //  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	  //  subdomains: 'abcd',
    L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	    subdomains: 'abcd',
	    minZoom: 0,
	    maxZoom: 20,
	    ext: 'png'
    }).addTo(map);

    //call getData function to load MegaCities data
    getData(map);
};

// popups
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
}

//function requesting MegaCities data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
          //create marker --circle--  options
            var geojsonMarkerOptions = {
                radius: 4,
                fillColor: "#ff0087",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //create a cluster group layer
            var markers = L.markerClusterGroup();

            //loop through features to create markers and add to MarkerClusterGroup
            for (var i = 0; i < response.features.length; i++) {
                var a = response.features[i];
                console.log("feature i", i, JSON.stringify(a));
               //add properties html string to each marker
                var properties = "";
                // collect the cities information
                for (var property in a.properties){
                    properties += "<p>" + property + ": " + a.properties[property] + "</p>";
                };
                var marker = L.marker(new L.LatLng(a.geometry.coordinates[1], a.geometry.coordinates[0]),
                    { properties: properties });

                //$(div).append('<br> Mega Cities:</br>' + JSON.stringify(properties));

                //console.log("props", JSON.stringify(properties));
                //add a popup for each marker
                marker.bindPopup(properties);
                //add marker to MarkerClusterGroup
                //console.log("marker", JSON.stringify(marker));
                markers.addLayer(marker);
            }

            //add marker cluster layer to the map
            map.addLayer(markers);

            //L.geoJson(response, {
              // only returns cities with pop greater than X
                //filter: function(feature, layer) {
                    //return feature.properties.Pop_1990 > 10.0;
                //}
                // return the info for each city
                //onEachFeature: onEachFeature

            //create a Leaflet GeoJSON layer and add it to the map
            //L.geoJson(response, {
            //    pointToLayer: function (feature, latlng) {
            //      return L.circleMarker(latlng, geojsonMarkerOptions);
            //    }
            // }).addTo(map);
        }
    });
};

$(document).ready(createMap);
