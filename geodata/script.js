(function () {
  var map = new L.Map('map').setView([42.354, -71.065], 14);
  var toner = new L.StamenTileLayer("toner").addTo(map);
  var mapc = L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {
    attribution: 'Tiles by <a href="http://www.mapc.org/">Metropolitan Area Planning Council</a>.'
  });
  var mapQuest = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    subdomains: '1234'
  });

  L.Util.ajax('geodata/allcensusacsdata.json').then(function(data) {
    var censusData = data;

    var tracts2010 = L.geoJson.ajax("geodata/tracts2010.json",{
      middleware:function(data){
        return topojson.feature(data, data.objects.tracts2010);
      },
      style: function(feature){
        var featureId = feature.id;
        try {
          var d = censusData[2008][featureId].totalpop;
        } catch (e) {
          console.log(e)
        }
        var fill = d > 5944 ? '#800026' :
                   d > 5323 ? '#BD0026' :
                   d > 4777 ? '#E31A1C' :
                   d > 4146 ? '#FC4E2A' :
                   d > 3552 ? '#FD8D3C' :
                   d > 2970 ? '#FEB24C' :
                   d > 2215 ? '#FED976' :
                              '#FFEDA0';
          return {
            weight: 0,
            color: "#0000ff",
            fillColor: fill
          };
       }
    }).addTo(map);

    var tracts2000 = L.geoJson.ajax("geodata/tracts2000.json",{
      middleware:function(data){
        return topojson.feature(data, data.objects.tracts2000);
      },
      style: function(feature){
        var featureId = feature.id;
        try {
          var d = censusData[2000][featureId].totalpop;
        } catch (e) {
          console.log(e)
        }
        var fill = d > 5944 ? '#800026' :
                   d > 5323 ? '#BD0026' :
                   d > 4777 ? '#E31A1C' :
                   d > 4146 ? '#FC4E2A' :
                   d > 3552 ? '#FD8D3C' :
                   d > 2970 ? '#FEB24C' :
                   d > 2215 ? '#FED976' :
                              '#FFEDA0';
        return {
          weight: 0,
          color: "#ff0000",
          fillColor: fill
        };
      }
    });


    var baseLayers = {
      "Map Quest": mapQuest,
      "Toner": toner,
      "MAPC": mapc
    };

    var overlays = {
        "2010 Tracts": tracts2010,
        "2000 Tracts": tracts2000
    };

    // TODO: ADD MAP LEGENDS
    L.control.layers(baseLayers, overlays).addTo(map);
  });

  //pulls Boston data from Socrata
  var constructionSites = "http://data.cityofboston.gov/resource/ktrb-k8k6.json?$select=project_name,project_uses,location";
  var crime = 'http://data.cityofboston.gov/resource/7cdf-6fgx.json?$select=incident_type_description,weapontype,location';

  //function to update the lat/lon as numbers instead of strings
  var coordinateFix = function(){
      this.location.latitude = Number(this.location.latitude);
      this.location.longitude = Number(this.location.longitude);
  }

  //marker styles!
  var cm = {
      radius: 4,
      fillColor: "#ff7800",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
  };
  var c2m = {
      radius: 6,
      fillColor: "#99ff22",
      opacity: 0.3,
      fillOpacity: 0.2
  };


  // var c = L.Util.ajax(constructionSites).then(function(data){    
  //     $.each(data, function (key, val) {
  //       coordinateFix();
  //       marker = L.circleMarker([this.location.latitude, this.location.longitude], cm).addTo(map);
  //       marker.bindPopup(this.project_name + '<br>' + this.project_uses);
  //     });
  // });

  // var c2 = L.Util.ajax(crime).then(function(data){    
  //     $.each(data, function (key, val) {
  //       coordinateFix();
  //       marker = L.circleMarker([this.location.latitude, this.location.longitude], c2m).addTo(map);
  //       marker.bindPopup(this.incident_type_description);
  //     });
  // });

  // Add foursquare API
  // initialize empty layer group for data
  var foursquarePlaces = L.layerGroup().addTo(map); 
  map.attributionControl.addAttribution('<a href="https://foursquare.com/">Places data from Foursquare</a>');

  // Cristen's foursquare account
  // var CLIENT_ID = 'WKWAY3UZFRFNRN2XOC2FQ1WEPMYMBKP0SD2AUEHSWEYBTIVX';
  // var CLIENT_SECRET = 'ZILRPJDFUY3DWCCRCD2U2SQUA0DFPTDESGOLSXS5O1BRKJYL';

  var API_ENDPOINT = 'https://api.foursquare.com/v2/venues/explore' +
    '?client_id=CLIENT_ID' +
    '&client_secret=CLIENT_SECRET' +
    '&radius=10000' + 
    '&limit=50' +
    '&v=20140531' +
    '&ll=LATLON'; //explore the venues on the map. max results the API likes is 50.

  var API_ENDPOINT2 = 'https://api.foursquare.com/v2/venues/VENUEID' +
    '?client_id=CLIENT_ID' +
    '&client_secret=CLIENT_SECRET' +
    '&v=20140531' +
    '&callback=?'; //get the details for a specific venue (needed to get price info)

  // Use jQuery to make an AJAX request to Foursquare to find venues
  $.getJSON(API_ENDPOINT
    .replace('CLIENT_ID', CLIENT_ID)
    .replace('CLIENT_SECRET', CLIENT_SECRET)
    .replace('LATLON', map.getCenter().lat +
        ',' + map.getCenter().lng), function(result, status) {

    if (status !== 'success') return alert('Request to Foursquare failed');

    var items = result.response.groups[0].items;
    
    // Get details for each venue and add as a marker on the map.
    for (var i = 0; i < items.length; i++) {
      $.getJSON(API_ENDPOINT2
        .replace('CLIENT_ID', CLIENT_ID)
        .replace('CLIENT_SECRET', CLIENT_SECRET)
        .replace('VENUEID', items[i].venue.id), function(result2, status) {

        if (status !== 'success') return alert('Request to Foursquare failed');

        // add venue details to popup on its marker on the map.
        var details = result2.response.venue;
        var latlng = L.latLng(details.location.lat,details.location.lng);
        var price;
        if (details.price !== undefined) { price = details.price.currency } else { price = "No price available." };
        var marker = L.marker(latlng)
        .bindPopup('<strong><a href="https://foursquare.com/v/' + details.id + '">' +
            details.name + '</a></strong><br>' + price)
        .addTo(foursquarePlaces);  
      });
    }
  });

  }());