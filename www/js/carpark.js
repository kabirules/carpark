var app = {
	
	carParkData: {"lat": "5", "lng": "5"},	
	
	init: function() {
		this.initFastClick();
	},
	
	initFastClick: function () {
		FastClick.attach(document.body);
	},
	
	devReady: function() {
		navigator.geolocation.getCurrentPosition(app.renderCoordsInMap, app.errorOnGeoReq);
		app.leerDatos();
	},
	
	renderCoordsInMap: function(position){
		var myMap = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13);

		L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={access_token}', {
		  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		  maxZoom: 18,
		  access_token: 'pk.eyJ1Ijoia2FiaXJ1bGVzIiwiYSI6ImNqMHB2bXh3YzAxYmIyd3FhcXA4bHBmOTIifQ.l0K5d65aWdssaoRUdkfLLw'
		}).addTo(myMap);
		
		//Marker for current position
		L.marker([position.coords.latitude, position.coords.longitude]).addTo(myMap).bindPopup('Here I am!').openPopup();
		
		//Marker for last saved position
		L.marker([app.carParkData.lat, app.carParkData.lng]).addTo(myMap).bindPopup('Here I parked!').openPopup();

		
		
		//Listener for longpress on map
		myMap.on('contextmenu', function(myEvent){
		  var myText = 'Marker in l(' + myEvent.latlng.lat.toFixed(2) + ') and L(' + myEvent.latlng.lng.toFixed(2) + ')';
		  if (myMarker) myMap.removeLayer(myMarker);
		  app.renderMarker(myEvent.latlng, myText, myMap);
		  var lat = myEvent.latlng.lat.toFixed(2);
		  var lng = myEvent.latlng.lng.toFixed(2);
		  var carPos = {"lat":lat, "lng":lng};
		  app.carParkData = carPos;
		  app.grabarDatos();
		});
	},
	
	//renders myMarker
	renderMarker: function(latlng, myText, map){
		myMarker = L.marker(latlng).addTo(map);
		//Not binding/showing popup by now
		//myMarker.bindPopup(myText).openPopup();
	},

	errorOnGeoReq: function(error) {
		console.log(error.code + ': ' + error.message);
	},
	
//SAVING DATA -INIT-	
	grabarDatos: function() {
		window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.gotFS, this.fail);
	},

	gotFS: function(fileSystem) {
		fileSystem.getFile("files/"+"model.json", {create: true, exclusive: false}, app.gotFileEntry, app.fail);
	},

	gotFileEntry: function(fileEntry) {
		fileEntry.createWriter(app.gotFileWriter, app.fail);
	},

	gotFileWriter: function(writer) {
		writer.onwriteend = function(evt) {
		  console.log("datos grabados en externalApplicationStorageDirectory");
		};
	writer.write(JSON.stringify(app.carParkData));
	},
// SAVING DATA -END	-

// READING DATA -INIT-  
	leerDatos: function() {
		window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.obtenerFS, this.fail);
	},
	
  obtenerFS: function(fileSystem) {
    fileSystem.getFile("files/"+"model.json", null, app.obtenerFileEntry, app.noFile);
  },
  
  obtenerFileEntry: function(fileEntry) {
    fileEntry.file(app.leerFile, app.fail);
  },

  leerFile: function(file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
      var data = evt.target.result;
      app.carParkData = JSON.parse(data);
    };
    reader.readAsText(file);
  },

  noFile: function(error) {
    console.log(error.code);
	alert('noFile');
  },

  fail: function(error) {
    console.log(error.code);
	alert('fail');
  }
// READING DATA -END-   
	
};

if ('addEventListener' in document) {
	
	//Marker for the car position (only one available)
	var myMarker; 
	
	document.addEventListener('DOMContentLoaded', function() {
		app.init();
	}, false);
	document.addEventListener('deviceready', function() {
		app.devReady();
	}, false);
}