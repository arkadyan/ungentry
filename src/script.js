define([
  'jquery',
  'leaflet',
  'censusLayer',
  'stamen',
  'mapSync'
  ], function($, L, CensusLayer){

    var map0, map1, map2;
    var census0, census1, census2;

    function setPropertyBrewer(iName, iColorBrewerName) {

    	census0.setProperty(iName+"_90",iColorBrewerName);
    	census1.setProperty(iName+"_00",iColorBrewerName);
    	census2.setProperty(iName+"_10",iColorBrewerName);

    }

    // ############################ MAPS SETUP STATIC ############################# //

    // Initialization method that setup the UI to display 3 maps
    function init3ViewsMode(){

    	$("#date").html("1990");

        map0 = L.map('map0').setView([42.354, -71.065], 13);
        new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', { attribution: "see modal"}).addTo(map0);
        census0 = new CensusLayer(map0, "./geodata/common/dataset/");
        map0.addLayer(census0);

        map1 = L.map('map1').setView([42.354, -71.065], 13);
        new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map1);
        census1 = new CensusLayer(map1, "./geodata/common/dataset/");
        map1.addLayer(census1);

        map2 = L.map('map2').setView([42.354, -71.065], 13);
        new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map2);
        census2 = new CensusLayer(map2, "./geodata/common/dataset/");
        map2.addLayer(census2);



/*
    	map0 = L.map('map0').setView([42.354, -71.065], 13);
    	new L.StamenTileLayer("toner", { attribution: "see modal"}).addTo(map0);
    	census0 = new CensusLayer(map0, "./geodata/common/dataset/");
    	map0.addLayer(census0);

    	map1 = L.map('map1').setView([42.354, -71.065], 13);
    	new L.StamenTileLayer("toner").addTo(map1);
    	census1 = new CensusLayer(map1, "./geodata/common/dataset/");
    	map1.addLayer(census1);

    	map2 = L.map('map2').setView([42.354, -71.065], 13);
    	new L.StamenTileLayer("toner").addTo(map2);
    	census2 = new CensusLayer(map2, "./geodata/common/dataset/");
    	map2.addLayer(census2);
*/
    	// synchronize three maps

    	map0.sync(map1);
    	map0.sync(map2);

    	map1.sync(map0);
    	map1.sync(map2);

    	map2.sync(map0);
    	map2.sync(map1);

    	setMarker();

    }

    // ################# MAP Init ###########################
    // Initialization method to build maps context
    // Switch in 3 maps context i.e. displaying 3 different
    // periods 1990 2000 2010
    //
    // Setup also links for responsive mode
    //
    function initDataMap(){

    	init3ViewsMode(); // init the view with 3 maps


    	$('#link_1990').click(function(event) {
    	  event.preventDefault();
    	  console.log('clicked 1990');
          if($('#map0_col').hasClass('hidden-xs')===true){
            $('#map0_col').removeClass('hidden-xs hidden-sm');  
            $('#map0_col').addClass('col-xs-9 col-sm-9');  
            $('#map1_col').removeClass('col-xs-9 col-sm-9');  
            $('#map1_col').addClass('hidden-xs hidden-sm');  
            $('#map2_col').removeClass('col-xs-9 col-sm-9');  
            $('#map2_col').addClass('hidden-xs hidden-sm');  
            
          }
          console.log('does 1990 have hidden-xs' + $('#map0').hasClass('hidden-xs'));
          
    	});
    	$('#link_2000').click(function(event) {
    	  event.preventDefault();
    	  console.log('clicked 2000');
    	  if($('#map1_col').hasClass('hidden-xs')===true){
            // $('#map0_col').removeClass('col-xs-9 col-sm-9  map-wrapper');  
            $('#map0_col').removeClass('col-xs-9 col-sm-9');  
            $('#map0_col').addClass('hidden-xs hidden-sm');  
            $('#map1_col').removeClass('hidden-xs hidden-sm');  
            $('#map1_col').addClass('col-xs-9 col-sm-9');  
            $('#map2_col').removeClass('col-xs-9 col-sm-9');  
            $('#map2_col').addClass('hidden-xs hidden-sm');  
          }

          console.log('does 2000 have hidden-xs' + $('#map1').hasClass('hidden-xs'));
    	});
    	$('#link_2010').click(function(event) {
    	  event.preventDefault();
    	  console.log('clicked 2010');
    	  if($('#map2_col').hasClass('hidden-xs')===true){
            $('#map0_col').removeClass('col-xs-9 col-sm-9');  
            $('#map0_col').addClass('hidden-xs hidden-sm');  
            $('#map1_col').removeClass('col-xs-9 col-sm-9');  
            $('#map1_col').addClass('hidden-xs hidden-sm');  
            $('#map2_col').removeClass('hidden-xs hidden-sm');  
            $('#map2_col').addClass('col-xs-9 col-sm-9');  
          }
          console.log('does 2010 have hidden-xs' + $('#map2').hasClass('hidden-xs'));
    	});

    }

    // ############### GEOLOCATE ##############################
    // Geolocate methods
    // Used to implement search address, that setup a marker
    // Here we call nominatim server to geolocate the address

    var last_marker = [];
    var current_marker = null;

    // Adding a marker
    function addMarker(iPos, ioMap, iCurrentMarker) {

    	if (last_marker[iPos]!=null) {
    		ioMap.removeLayer(last_marker[iPos]);
    	}
    	last_marker[iPos] = L.marker(iCurrentMarker).addTo(ioMap);

    }

    // Set a marker on all maps depending on the current mode
    function setMarker(){

    	if (current_marker!=null) {

    		map0.setView(current_marker, 16,  {
    			reset : true,
    			animate :true
    		});

    		addMarker(0, map0, current_marker);

    		//map1.setView(current_marker);
    		addMarker(1, map1, current_marker);

    		//map2.setView(current_marker);
    		addMarker(2, map2, current_marker);

    	}

    }

    // Perform search in nominatim address method
    function bindAddress(){

    	// retrieve the address value
    	var address=$("#address").val();

    	// perform ajax call to nominatim
        	$.ajax({
        		type: "GET",
        		url: "https://nominatim.openstreetmap.org/search",
        		data: { q: address, format: "json", polygon : "1" , addressdetails :"1" }
    		})
    		.done(function( data ) { // if address found

    		// takes the first geolocated data
    		// and record current_marker variable
    		current_marker = data[0];
    		// draws a marker from geolocated point
    		setMarker();

        	});

    }

    // Binds search button + return key to the address
    function initGeolocate(){

        $("#sendaddress").click(bindAddress);

        $("#address").keypress(function(e){
        	  if(e.which == 13){
        	  	bindAddress();
        	  	e.preventDefault();
        	  }
        });

    }


    return {
      setPropertyBrewer: setPropertyBrewer,
      bootstrap: function(){
        // #################### MAIN  ###############################
        // Main initialization method
        // When all page libraries are loaded this function is called
        //
        // Initializing maps
        initDataMap();

        // Initialization geolocation search buttons & field
        initGeolocate();
      }
    }

});
