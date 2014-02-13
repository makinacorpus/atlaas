/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoiView = Backbone.View.extend({

        template: JST['app/scripts/templates/poi-view.ejs'],

        initialize: function () {
        	console.log(this.model.toJSON());
        	this.marker = L.marker([this.model.get('lat'), this.model.get('lng')]);

        	// Create the marker popup
        	// var popup = document.createElement('a');
        	// popup.href = App.Config.mapUrl + this.model.get('slug') + '/';
        	// popup.innerHTML = this.model.get('name');

        	// this.marker.bindPopup(popup);
        }
    });

})();
