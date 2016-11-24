

var initialLocations = [
	{
		name: 'Big Temple',
		lat: 10.7827828,
		long: 79.1318463,
		sealevel: 'Sea-level : 64 metres'
	},
	{
		name: 'Sathyam Cinemas',
		lat: 13.0553683,
		long: 80.2579668,
		sealevel: 'Sea-level : 12 metres'
	},
	{
		name: 'Sterling Holidays Resort,Ooty',
		lat: 11.3968405,
		long: 76.7018585,
		sealevel: 'Sea-level : 2311 metres'
	},
	{
		name: 'Wonderla Amusement Park',
		lat: 12.8342718,
		long: 77.4010444,
		sealevel: 'Sea-level : 782 metres'
	},
	{
		name: 'Apollo Hospital',
		lat: 13.0703702,
		long: 80.1506995,
		sealevel: 'Sea-level : 15 metres'
	},
	{
		name: 'The Chennai Silks, Erode',
		lat: 11.3442725,
		long: 77.7297591,
		sealevel: 'Sea-level : 168 metres'
	},
	{
		name: 'Palani Murugan Temple',
		lat: 10.4489188,
		long: 77.5209392,
		sealevel: 'Sea-level : 327 metres'

	}
];

// Declaring global variables
var map;

var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.long = data.long;
	this.sealevel = data.sealevel;
	this.URL = "";
	this.street = "";
	this.city = "";
	this.rating = "";

	this.visible = ko.observable(true);

	// Foursquare API settings
	 var client_ID_Foursquare = "31FXMTVIIYQNLM3JW3HX3RXYOFVRES0JMCKL1XS1ZBQP4O3G";
	 var client_Secret_Foursquare = "BDOE4AJFYHKUQQNCJLJGCVOKYPKRQH2IPVYZ43CWTZGWFWMC";

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.long + '&client_id=' + client_ID_Foursquare + '&client_secret=' + client_Secret_Foursquare + '&v=20160118' + '&query=' + this.name;

	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		self.URL = results.url;
		if (typeof self.URL === 'undefined'){
			self.URL = "";
		}
		self.rating = results.location.rating;
		if (typeof self.rating === 'undefined'){
			self.rating = "";
		}
		self.street = results.location.formattedAddress[0];
     	self.city = results.location.formattedAddress[1];

	}).fail(function() {
		alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
	});

	this.contentString = '<div class="info-window-content"><div class="title"><h1>' + data.name + "</h1></div>" +
		'<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.rating + "</div>" +
		'<div class="content">' + data.sealevel + "</div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div></div>";

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.long),
			map: map,
			title: data.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.rating + "</div>" +
        '<div class="content">' + data.sealevel + "</div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div></div>";

        self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 7,
			center: {lat: 11.1271225, lng: 78.6568942}
	});

	initialLocations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
	ko.applyBindings(new AppViewModel());
}

function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}