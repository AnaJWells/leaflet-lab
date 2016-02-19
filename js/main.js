/* initialize the map and set its view */
// setview returns a map object
//Step #1 create a leflet map
function createMap(){
    //Initialize the map space
    var map = L.map('map').setView([20,0], 2);

    //add them tilelayer
		L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    	subdomains: 'abcd',
    	maxZoom: 19
    }).addTo(map);

    //call the getData function to load MegaCities data
    getData(map);
};

//Step #2 retrieve data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/agtoGDP.geojson", {
        dataType: "json",
        success: function(response){
          //create marker --circle--  options
					createPropSymbols(response, map);
				}
			});
};

//Step 3: Add circle markers for point features to the map
function createPropSymbols(response, map){
            //callback function
						//create circleMarkers and add them to the cities
          L.geoJson(response, {
              pointToLayer: pointToLayer,

              filter: function(feature, layer) {
                return feature.properties[2014] > 7 }

          }).addTo(map);
}; //end create prop symbol

//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Step #4 Determine which attribute to visualize with proportional symbols
    var attribute = "2014";

    //create marker options
    var options = {
        fillColor: "#ff0087",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //Step #5 For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Step #6 Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //popup content is now just the city name
    var popupContent = feature.properties.CountryName;
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });

    //build popup content string
    var panelContent = "<p><b>Country Name:</b> " + feature.properties.CountryName + "</p>" ;

    //"<p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";
    console.log(feature.properties[attribute]);
     //add formatted attribute to popup content string
     //var year = attribute.split("_")[1];
    panelContent += "<p>" + feature.properties[attribute] + "% Agr to GDP in " + attribute + "</p>";

    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(panelContent);
        }
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 20;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

$(document).ready(createMap);
