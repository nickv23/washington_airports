$(document).ready(function () {

    // 1. Create a map object.
    var mymap = L.map('map', {
        center: [47.7511, -120.7401],
        zoom: 7,
        maxZoom: 10,
        minZoom: 3,
        detectRetina: true // detect whether the sceen is high resolution or not.
      });

      // 2. Add a base map.
      var darkmode = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png');

      var airports = null;

      // Get GeoJSON and put on it on the map when it loads
      airports = L.geoJson.ajax("assets/washington_airports.geojson", {
          // assign a function to the onEachFeature parameter of the airports object.
          // Then each (point) feature will bind a popup window.
          // The content of the popup window is the value of `feature.properties.company`
          onEachFeature: function (feature, layer) {
              layer.bindPopup(feature.properties.NAME);
          },
          attribution: 'temp'
      }).addTo(mymap);

      var i = 0;
      var lat1; var lat2; var lon1; var lon2;
      var latlng1; var latlng2; var latlngs;
      var polyline;
      distanceCalc = L.geoJson.ajax("assets/washington_airports.geojson", {
          // assign a function to the onEachFeature parameter of the airports object.
          // Then each (point) feature will bind a popup window.
          // The content of the popup window is the value of `feature.properties.company`
          onEachFeature: function (feature, layer) {
            layer.on('click', function(e) {
                var name = feature.properties.NAME;
                var textnode;
                if (i % 2 == 0) {
                    i++;
                    if (mymap.hasLayer(polyline)) {
                      mymap.removeLayer(polyline);
                    }
                    document.getElementById("PointA").innerHTML = '';
                    document.getElementById("PointB").innerHTML = '';
                    lat1 = feature.properties.X;
                    lon1 = feature.properties.Y;
                    latlng1 = L.latLng(lon1, lat1);
                    textnode = document.createTextNode(name + " --> ");
                    document.getElementById("PointA").appendChild(textnode);
                } else {
                    i++;
                    lat2 = feature.properties.X;
                    lon2 = feature.properties.Y;
                    latlng2 = L.latLng(lon2, lat2);
                    latlngs = [latlng1, latlng2];
                    polyline = L.polyline(latlngs, {color: 'red'}).addTo(mymap);
                    mymap.fitBounds(polyline.getBounds());
                    var earth_r = 6371e3;
                    var phi1 = lat1 * Math.PI/180;
                    var phi2 = lat2 * Math.PI/180;
                    var delta_phi = (lat2-lat1) * Math.PI/180;
                    var delta_lambda = (lon2-lon1) * Math.PI/180;
                    var a = Math.sin(delta_phi/2) * Math.sin(delta_phi/2) +
                        Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta_lambda/2) * Math.sin(delta_lambda/2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    var meters = earth_r * c;
                    var miles = (meters * 0.000621371).toFixed(2);
                    textnode = document.createTextNode(name + " = " + miles + " miles");
                    document.getElementById("PointB").appendChild(textnode);
                }
            });
          },
          attribution: 'temp'
      });


      var grayscale = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png');
      var streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png').addTo(mymap);
      var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x');

      var baseLayers = {
          'Dark Mode': darkmode,
          'Grayscale': grayscale,
          'Streets': streets,
          'Satellite': satellite
      };

      var overlays = {airports, distanceCalc};

      L.control.layers(baseLayers, overlays, {
          collapsed: false,
          position: 'topright'
      }).addTo(mymap);
})
