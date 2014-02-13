/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoiView = Backbone.View.extend({

        template: JST['app/scripts/templates/poi-view.ejs'],

        // Index where to look for the marker location in the model
        locationIndex: 0,

        initialize: function () {
        	console.log(this.model.toJSON());
        	
        	var latitude 	= this.model.get('lieux')[this.locationIndex].latitude,
        		longitude 	= this.model.get('lieux')[this.locationIndex].longitude;
        	
        	this.marker = L.marker([latitude, longitude]);

        	// Create the marker popup
        	// var popup = document.createElement('a');
        	// popup.href = App.Config.mapUrl + this.model.get('slug') + '/';
        	// popup.innerHTML = this.model.get('name');

        	// this.marker.bindPopup(popup);
        }
    });

})();
