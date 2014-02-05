/*global app, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.AppView = Backbone.View.extend({

        el: 'body',

        initialize: function () {
        	this.$sidebar = $('#aside-main');
        	this.$mainContainer = $('#container-main');
        	this.$pageContainer = $('#pages-container');
        	this.$toggleSidebarBt = $('#toggle-sidebar');

        	this.initNavigation();
        },

        render: function () {
        	this.$pageContainer.empty();
        },

        renderMap: function () {
        	this.render();

        	var mapView = new atlaas.Views.MapView({id: 'map'});
        	// Prepare DOM before initializing mapView cause Leaflet needs an existing element on init.
        	this.$pageContainer.append(mapView.template({id: mapView.id}));

        	mapView.render().initMap();
        },

        renderNews: function () {
        	this.render();

        	var newsView = new atlaas.Views.NewsView();
        	this.$pageContainer.append(newsView.template());

        	newsView.render();
        },

        initNavigation: function () {
        	this.$toggleSidebarBt.on('click', _.bind(function (e) {
        		e.preventDefault();

        		var currentState 		= this.$sidebar.attr('data-visible'),
        			newState 			= currentState == 'true' ? false : true,
        			mainContainerX 		= currentState == 'true' ? '0' : '-220px',
        			tween;

        		tween = TweenLite.to(this.$mainContainer, 0.6,
        			{'x': mainContainerX,
        			ease: Power2.easeInOut,
        			onComplete: function () {
        				
        			},
        			onCompleteScope: this});

        		this.$sidebar.attr('data-visible', newState);
        		this.$mainContainer.attr('data-visible', !newState);
        	}, this));
        }

    });

})();
