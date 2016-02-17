//
/* initialize the map and set its view */
// setview returns a map object
//function to instantiate the Leaflet map
function createMap(){
    //Initialize the map
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

//function to retrieve the MegaCities data and place it on the map
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

            //callback function
						//create circleMarkers and add them to the cities
            L.geoJson(response, {
                pointToLayer: function (feature, latlng) {
                  return L.circleMarker(latlng, geojsonMarkerOptions);
                }
             }).addTo(map);
        }
    });
};

$(document).ready(createMap);
