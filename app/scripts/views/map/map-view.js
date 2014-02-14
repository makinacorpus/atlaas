/*global app, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.MapView = Backbone.View.extend({
        events: {
            'click .submenu__item'        : 'openMenu',
            'click .submenu__item--back'  : 'closeMenu',
            'click .results-menu__item'   : 'clickResultHandler',
            'click .leaflet-marker-icon'  : ''
        },

        template: JST['app/scripts/templates/map-view.ejs'],

        attributes: { id: 'map-container', class: 'container' },

        initialize: function () {
        },

        render: function () {
            this.$el.html(this.template({ id:this.options.map }));

            return this;
        },

        // called only when template is rendered cause Leaflet needs a DOM element
        initMap: function () {
            this.map = L.map(this.options.map, { maxZoom: 14, minZoom: 3 }).setView([46.883, 2.872], 6);

            // add an OpenStreetMap tile layer
            L.tileLayer('http://{s}.livembtiles.makina-corpus.net/makina/osmlight-france/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            this.renderPois();
        },

        renderPois: function () {
            this.pois = new atlaas.Collections.PoisCollection();

            this.poisView = new atlaas.Views.Map.PoisView({ collection: this.pois });

            this.listenToOnce(this.poisView.collection, "sync", function() {
                var markers = L.markerClusterGroup({ chunkedLoading: true });

                // add markers on map for each poiView
                _.each(this.poisView.poiViewCollection, function (poiView) {
                    _.each(poiView.markers, function (marker) {
                        // marker.bindPopup();
                        markers.addLayer(marker);
                    }, this);
                }, this);

                markers.on('click', _.bind(function (e) {
                    var poiId = e.layer.options.id;
                    var poi = _.find(this.poisView.poiResultsViewCollection, function(poiResultView){
                        return poiResultView.model.id == poiId;
                    });

                    this.$resultsContainer.scrollTop(this.$resultsContainer.scrollTop() + poi.$el.position().top);
                }, this));

                this.map.addLayer(markers);
            });
        },

        initResultsMenu: function () {
            var categories = new atlaas.Collections.CategoriesCollection();

            var categoriesView = new atlaas.Views.Map.CategoriesView({ el: this.$el.find('.results-menu__categories .submenu'), collection: categories });
            // this.$el.append(categoriesView);

            this.$categoriesContainer = this.$el.find('.results-menu__categories');
            this.$resultsContainer = this.$categoriesContainer.find('.results-menu__wrapper');
            this.$menuWrapper = this.$categoriesContainer.find('.menu-wrapper');
        },

        openMenu: function (e) {
            var $item = $(e.currentTarget),
            $currentSubmenu = $item.parents('ul'),
            $newSubmenu = $item.siblings('ul');
            
            if ($newSubmenu.length == 0) return;

            e.preventDefault();

            if (TweenLite.getTweensOf(this.$menuWrapper).length != 0) return;

            var $menuIn = $newSubmenu.clone().addClass('in').appendTo(this.$categoriesContainer);
            
            var tweenOut = TweenLite.to(this.$menuWrapper, 0.4,
                { 'x': '-220px',
                'z': '10px',
                'opacity': '0',
                ease: Power2.easeInOut,
                onComplete: function () {
                    tweenOut.seek(0);
                    tweenOut.pause();
                    tweenOut.kill();
                } });

            TweenLite.fromTo($menuIn, 0.4,
                { 'x': '220px',
                'opacity': '0'},
                { 'x': '0px',
                'opacity': '1',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $currentSubmenu.addClass('subview');
                    $item.parent().addClass('subviewopen');
                    $menuIn.remove();
                }
                });
        },

        closeMenu: function (e) {
            var $item = $(e.currentTarget),
            $currentSubmenu = $item.closest('ul'),
            $parentMenu = $currentSubmenu.parent().closest('ul');

            e.preventDefault();

            if (TweenLite.getTweensOf(this.$menuWrapper).length != 0) return;

            var $menuIn = $parentMenu.clone().addClass('in').removeClass('subview').addClass('subviewopen').appendTo(this.$categoriesContainer);
            
            var tweenOut = TweenLite.to(this.$menuWrapper, 0.4,
                { 'x': '220px',
                'opacity': '0',
                ease: Power2.easeInOut,
                onComplete: function () {
                    tweenOut.seek(0);
                    tweenOut.pause();
                    tweenOut.kill();
                } });

            TweenLite.fromTo($menuIn, 0.4,
                { 'x': '-220px',
                'opacity': '0'},
                { 'x': '0px',
                'opacity': '1',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $parentMenu.removeClass('subview');
                    $('.subviewopen').removeClass('subviewopen');
                    $menuIn.remove();
                }
                });
        },

        showMarkers: function () {
            console.log('showMarkers');
        },

        clickResultHandler: function (e) {
            e.preventDefault();

            var poiId = $(e.target).attr('href');

            var poi = _.find(this.poisView.poiViewCollection, function(poiView){
                return poiView.model.id == poiId;
            });

            this.map.panTo(poi.markers[0].getLatLng());
        }

    });

})();
