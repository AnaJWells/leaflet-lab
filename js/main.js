//* initialize the map and set its view */
//function to instantiate the Leaflet map
function createMap(){
    //Initialize the map and set its view
    var map = L.map('map').setView([20, 0], 2);

    //Esri_WorldPhysical
    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
    	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
    	maxZoom: 10
    }).addTo(map);

    getData(map);
};

//function requesting  GEOJSON data and if success callback functions
function getData(map){
    //load the data
    $.ajax("data/agData.geojson", { //, {agData.geojson  toGDP.geojson"
        dataType: "json",
        success: function(data){
          //the attributes array -- yrs for sequence
            var attributes = processData(data);
            // create proportional popups symbols for retrieving information
            createPropSymbols(data, map, attributes);
            createSequenceControls(map, attributes);
            //changeCirclesWhenZooming (map, attributes);
            createLegend(map, attributes);
         }
    });
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
		map.addLayer(featLayer); // add layer to map

    ///// This sections is for the fifth Operator
    // get the name for the search control
    var name;
    for (var attribute in data.features[0].properties){
        //only take attributes with values
        if (attribute == "CountryName") {
            name = attribute;
        };
    }
    //
    console.log (data.features[0].properties);
		// add search control to the map layer
		var searchControl = new L.Control.Search({
			layer: featLayer,
			propertyName: name, //feature.properties.CountryName, featLayer.title,
			circleLocation:false
		});  //

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


/////////////////////
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

    createPopup(feature.properties, attribute, layer, options.radius)
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
// This is a better option for my circles
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

//calculate the radius of each proportional symbol
function calcPropRadius2 (attValue) {
	//scale factor to adjust symbol size evenly
	var scaleFactor = 40;
	//area based on attribute value and scale factor
	var area = attValue * scaleFactor;
	//radius calculated based on area
	var radius = Math.sqrt(area/Math.PI);
	return radius;
};


/////////////////////////////////////////
/////////////////// ----------- Sequence
function createSequenceControls(map, attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
            //create slider
            $(container).append('<input class="range-slider" type="range">');
            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">atras</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">adelante</button>');

            //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });

            return container;
          }
      });

      map.addControl(new SequenceControl());

      //replace button content with images
    	$('#reverse').html('<img src="img/reverse.png">');
    	$('#forward').html('<img src="img/forward.png">');

      //set  attributes for slider
      $('.range-slider').attr({
        type: 'range',
        max: 6,
        min: 0,
        value: 0,
        step: 1
      });

      //click listener for buttons
      $('.skip').click(function(){
              //get the old index value
        var index = $('.range-slider').val();
              //Increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
          index++;
                //wrap around to first attribute
          index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
          index--;
                //wrap around to last attribute
          index = index < 0 ? 6 : index;
        };
              //update slider
        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index]);
      }); //end of listerner or buttons

      //Input listener for slider
      $('.range-slider').on('input', function(){
        //set get the new index value within 0 to 6
        var index = $(this).val();
        console.log(index);
        updatePropSymbols(map, attributes[index]);
      });
};


function updatePropSymbols(map, attribute){
    // attribute is a year
    // updatePropSymbos making sure that the new symbol has not a null value
  map.eachLayer(function(layer){
       // does the layer has a feature_name and value to this year?
      if (layer.feature && layer.feature.properties[attribute]){
        //update the layer size and popup
        var props = layer.feature.properties;

        var radius = calcPropRadius(props[attribute]);
        // sets new radius size
        layer.setRadius(radius);

        // update popup and legend content
        createPopup(props, attribute, layer, radius);
        updateLegend(map, attribute);
      }
      // if the layer has this feature_name, but the value is null, update popup with null value
      // and circle must have zero radius (no circle)
      else if (layer.feature && layer.feature.properties.CountryName ) //exist, but null value
      {

        var attValue = Number(layer.feature.properties[attribute]);
        if (attValue == 0){
          layer.setRadius(attValue);
        }
      }; //end of if
  }); // end eachLayer
};

////////////////////////////
/////////// Legends
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            //var container = L.DomUtil.create('div', 'sequence-control-container');

            var container = L.DomUtil.create('div', 'legend-control-container');
            $(container).append('<div id="temporal-legend">')

      			//start attribute legend svg string
      			var svg = '<svg id="attribute-legend" width="180px" height="190px">';

      			//array - circle element for three attr values
      			var circles = {
      				max: 20,
      				mean: 40,
      				min: 60
      			};

      			//loop to add each circle and text to svg string
      			for (var circle in circles){
      				//circle string
      				svg += '<circle class="legend-circle" id="' + circle +
               '" fill="#14a137" fill-opacity="0.4" stroke="#000000" cx="30"/>';
      				svg += '<text id="' + circle + '-text" x="65" y="' +
              circles[circle] + '"></text>';
      			};
      			//close svg string
      			svg += "</svg>";

      			//add attribute legend svg to container
      			$(container).append(svg);
            return container;
        }
    });

    map.addControl(new LegendControl());
    var initialYear = attributes[0];
    updateLegend(map, initialYear);
};
///
//////

function updateLegend(map, attribute){
	//create content for legend
	var year = attribute;
	var content = "Per Agr of GDP in " + year;
	//replace legend content
	$('#temporal-legend').html(content);

	var circleValues = getCircleValues(map, attribute);  //legend values
	for (var key in circleValues){
		//get the radius

    //I had to add 2 to make circles with very small circles to print
		  var radius = calcPropRadius(circleValues[key]) + 2;  //otherwise radius is too small

		$('#'+key).attr({
			cy: 59 - radius,
			r: radius
		});

    //format legend values
		$('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 +
     "% ag per GDP");
	};
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
	//start with min at highest possible and max at lowest possible number
	var min = Infinity,
		max = -Infinity;

	map.eachLayer(function(layer){
		//get the attribute value
		if (layer.feature){
			var attributeValue = Number(layer.feature.properties[attribute]);
      //console.log ('es zero?', attributeValue);
      // make sure taht the circles have not a min of zero due to null values
      if (attributeValue > 0) {
        //console.log('no es zero?', attributeValue);
			   //test for min
			      if (attributeValue < min){
				          min = attributeValue;
			      };

			         //test for max
			      if (attributeValue > max){
				          max = attributeValue;
			      };
      };
		};
	});
	//set mean
	var mean = (max + min) / 2;
  //console.log(min,mean, max);
	//return values as an object
	return {
		max: max,
		mean: mean,
		min: min
	};
};

////////
//Resize proportional symbols according to new attribute values


// finally create the map!
$(document).ready(createMap);



////////
function changeCirclesWhenZooming (map, attributes) {
  var times;
  map.on('zoomend', function(layer) {

      map.eachLayer (function(layer) {
        var currentZoom = map.getZoom();
        if (layer.feature && layer.feature.properties[attribute]){
              //update the layer popups
            var props = layer.feature.properties;
            var attValue = props[attribute];
            var radius = calcPropRadius(attValue);

            if (layer.options) {
              var radious = layer.options.radius;
              console.log('before', radious);
              layer.options.setRadius(layer.options.setRadius * 100);
              console.log('later',  layer.options.radius);
            };
        };
      });
  });
};
