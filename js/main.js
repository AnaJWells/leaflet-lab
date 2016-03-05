//* initialize the map and set its view */
//function to instantiate the Leaflet map
function createMap(){
    //Initialize the map and set its view
    var map = L.map('map').setView([20, 0], 2);

    //Esri_WorldPhysical
    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
    	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
    	maxZoom: 7
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
         }
    });
};

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

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a GeoJSON layer and add it to the map
    // pointToLayer is an option of L.geoJson
    L.geoJson(data, {
        pointToLayer: function (feature, latlng ) {
            //feature contains data of each Country
            //attributes is an array of keys
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];  //does this for all the countries
    //console.log(attribute);  //1985  do this only for first yr
    //create marker options
    var options = {
        fillColor: "#14a137",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6,
        stroke: false
    };

    //console.log('antes de num', feature.properties[attribute]);
    //For each feature, determine its agtoGDP value for the selected year
    var attValue = Number(feature.properties[attribute]);
    //var attValue = feature.properties[attribute];
    attValue = attValue.toFixed(2);

/*    if (attValue == 0) {
          options.fillOpacity = 0.0; //0.6
          options.opacity = 0.0;  //1
          options.radius = calcPropRadius(0.01);
    }
    else
    {
          options.radius = calcPropRadius(attValue);
    }
*/
    options.radius = calcPropRadius(attValue);
    var layer = L.circleMarker(latlng, options, {
        title: feature.properties.CountryName,
    });

    createPopup(feature.properties, attribute, layer, options.radius);

    //event listeners to open popup on hover
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

  var popupContent = "<p><b>Country Name:</b> " + properties.CountryName + "</p>" ;
  popupContent += "<p>" + attValue + "% Agr to GDP in " + attribute + "</p>";

  //bind the popup to the circle marker
  layer.bindPopup(popupContent, {
      offset: new L.Point(0,-radius),
  });
};


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 15;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};


///////////////// ----------- Sequence
// function that set a slider and put it in the panel
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');

    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

    //set  attributes for slider
    $('.range-slider').attr({
      max: 6,
      min: 0,
      value: 0,
      step: 1
    });

     //Input listener for slider
    $('.range-slider').on('input', function(){
        //set get the new index value within 0 to 6
        var index = $(this).val();
        console.log('index', index);
        console.log('value', attributes[index]);
        updatePropSymbols(map, attributes[index]);
    });

    //click listener for buttons
    $('.skip').click(function(){
      //get the old index value
      var index = $('.range-slider').val();
      console.log ('skip',index);
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

};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    // attribute is a year
  map.eachLayer(function(layer){

       // does the layer has a feature name properties?
      if (layer.feature && layer.feature.properties[attribute]){
        //update the layer style and popup

        var props = layer.feature.properties;

        //update each feature's radius based on new attribute values
        var attValue = props[attribute];

        var radius = calcPropRadius(attValue);
        // sets new radius size
        layer.setRadius(radius);
        // update content to popup
        createPopup(props, attribute, layer, radius);

      }; //end of if
  }); // end eachLayer
};

$(document).ready(createMap);
