	//var data = us_states;

	//map.addLayer (new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));	//base layer
function createMap(){
	    //Initialize the map and set its view
	    //var map = L.map('map').setView([20, 0], 2);
			var map = new L.Map('map', {zoom: 2, center: new L.latLng([20,0]) });
	    //Esri_WorldPhysical
	    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
	    	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
	    	maxZoom: 10
	    }).addTo(map);
	    getData(map);
};

function getData(map){
	    //load the data
	    $.ajax("data/agtoGDP.geojson", { //, agData.geojson  toGDP.geojson"
	        dataType: "json",
	        success: function(data){
						  var attributes = processData(data);
						// create proportional popups symbols for retrieving information
						  createPropSymbols(data, map, attributes);
	            //controlSearchCountries(map);
	            //changeCirclesWhenZooming (map, attributes);
	            //createLegend(map, attributes);
	         }
	    });
};


function controlSearchCountries(map) { // searchLayer){

	map.eachLayer(function(layer){

		map.addControl ( new L.Control.Search ({ //
			layer: layer,
			initial: false,
			position:'topright',
			zoom: 18,
			propertyName: 'name',
			//buildTip: function(text, val) {
				//var type = val.layer.feature.properties.amenity;
				//return '<a href="#" class="'+type+'">'+text+'<b>'+type+'</b></a>';
			//}
		})  );
	});

		//map.addControl(new controlSearch);
	//map.addControl( controlSearch );
    console.log ('here');

	 //map.addControl( new L.Control.Search({layer: searchLayer}) );
	 //L.map('map', { searchControl: {layer: searchLayer} });
};




////////
function processData(data){
    //empty array to hold attributes
    var attributes = [];
    //properties of the first CountryName in the dataset; could use anyone
    var properties = data.features[0].properties;

    //push each attribute name into attributes array -- years then name
    for (var attribute in properties){
        //only take attributes with values
        if (attribute !== "CountryName") { //}.indexOf("CountryName") > -1){
            attributes.push(attribute);
        };
    };
    return attributes;
};

//// Retrieve
//////Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a GeoJSON layer and add it to the map
    // pointToLayer is an option of L.geoJson
    var featLayer = L.geoJson(data, {
        pointToLayer: function (feature, latlng ) {
            //feature contains data of each Country
            //attributes is an array of keys
            return pointToLayer(feature, latlng, attributes);

        }
    })
		map.addLayer(featLayer);

		// add search control to the map layer
		var searchControl = new L.Control.Search({
			layer: featLayer,
			propertyName: 'name', //feature.properties.CountryName, featLayer.title,
			circleLocation:false

		});  //.addTo(map);

		searchControl.on('search_locationfound', function(e) {
				 // style of search
		     e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
				 if(e.layer._popup)
			 		  {e.layer.openPopup()};
	  }).on('search_collapsed', function(e) {
		     featuresLayer.eachLayer(function(layer) {	//restore feature color
			        featuresLayer.resetStyle(layer);
		     });
	  });
		// add to map to inizialize search control
		map.addControl( searchControl );  //inizialize search control
};







//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];  //does this for all the countries
    //create marker options
    var options = {
        fillColor: "#14a137",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6,
        stroke: false
    };

    //For each feature, determine its agtoGDP value for the selected year
    var attValue = Number(feature.properties[attribute]);

    // calculate radius for the circle
    options.radius = calcPropRadius(attValue);

    //create the circlemarker and popups with the options and add to layer
    // this works for null values : )
    var layer = L.circleMarker(latlng, options, {
          title: feature.properties.CountryName,
    });

    createPopup(feature.properties, attribute, layer, options.radius);

    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};



///////////////   createPopup function
function createPopup(properties, attribute, layer, radius) {
  // format the popup content
  var attValue = Number(properties[attribute]);
  attValue = attValue.toFixed(2);
///////
  var popupContent = "<p><b>Country Name:</b> " + properties.CountryName + "</p>" ;
  popupContent += "<p>" + attValue + "% Agr to GDP in " + attribute + "</p>";

  //bind the popup to the circle marker
  layer.bindPopup(popupContent, {
      offset: new L.Point(0,-radius),
  });
};

//calculate the radius of each proportional symbol
function calcPropRadius (attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.75;  //15;
    //area based on attribute value and scale factor
    var area = Math.pow(attValue * scaleFactor,2);
    //console.log('area', area);
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};

//map.addControl( new L.Control.Search({layer: searchLayer}) );
//L.map('map', { searchControl: {layer: searchLayer} });
$(document).ready(createMap);

/*
	searchControl.on('search_locationfound', function(e) {
		e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
		if(e.layer._popup)
			e.layer.openPopup();
	}).on('search_collapsed', function(e) {
		featuresLayer.eachLayer(function(layer) {	//restore feature color
			featuresLayer.resetStyle(layer);
		});
	});
map.addControl( searchControl );
//////
    //Loads external geojson file:
var control = new L.Control.fileLayerLoad({
        fileSizeLimit: 5000,
        fitBounds: true, //MOVE THE CENTER OF THE SCREEN
        layerOptions: {style: style,
        onEachFeature: function(feature, layer) {
            layer.bindPopup( "Name: " + feature.properties.Name );
        }}
    }).addTo(map);

    //Search within specified layer:
map.addControl(L.control.search({layer: control, propertyName: 'Name', circleLocation:true}));

 */
