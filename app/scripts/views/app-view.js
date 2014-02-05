/*global app, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.AppView = Backbone.View.extend({

        el: 'body',

        initialize: function () {
        	this.$pageContainer = $('#pages-container');
        },

        showMap: function () {
        	var mapView = new atlaas.Views.MapView({id: 'map'});
        	// Prepare DOM before initializing mapView cause Leaflet needs an existing element on init.
        	this.$pageContainer.append(mapView.template({id: mapView.id}));

        	mapView.render().initMap();
        },

        showNews: function () {
        	var newsView = new atlaas.Views.NewsView();
        	this.$pageContainer.append(newsView.template());

        	newsView.render();
        }

    });

})();
