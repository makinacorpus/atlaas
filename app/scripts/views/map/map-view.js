/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.MapView = Backbone.View.extend({
        events: {
            'click .submenu__item'          : 'openMenu',
            'click .submenu__item--back'    : 'closeMenu',
            'click .results-menu__item'     : 'clickResultHandler'
        },

        template: JST['app/scripts/templates/map-view.ejs'],

        attributes: { id: 'map-container', class: 'container' },

        state: { categories: null, bounds: [] },

        initialize: function () {
            this.pois           = [],
            this.filteredPois   = []
            this.$activeResult  = $()
        },

        render: function () {
            this.$el.html(this.template({ id:this.options.map }));

            this.initMenu();

            return this;
        },

        // called only when template is rendered cause Leaflet needs a DOM element
        initMap: function () {
            this.map = L.map(this.options.map, { maxZoom: 14, minZoom: 3, attributionControl: false }).setView([46.883, 2.872], 6);

            L.control.attribution({position: 'bottomleft'}).addTo(this.map);

            L.tileLayer('http://{s}.livembtiles.makina-corpus.net/makina/osmlight-france/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            // this.map.on('moveend', this.onMapViewChanged, this);
            this.map.on('zoomend', this.onMapZoomChanged, this);

            this.initPois();
        },

        initPois: function () {
            this.pois = new atlaas.Collections.PoisCollection();

            this.poisView = new atlaas.Views.Map.PoisView({ collection: this.pois });

            this.poisView.poiLayer.addTo(this.map);
            
            this.listenTo(this.poisView.collection, 'sync', function () {
                // this.poisView.markers = L.markerClusterGroup({ chunkedLoading: true });

                this.renderPois();

                // this.map.addLayer(this.poisView.markers);
            });
            

            this.listenTo(this.poisView, 'openResult', function (poi) {
                this.poiDetailView = new atlaas.Views.Map.PoiDetailView({ model: poi.model });
                this.$el.append(this.poiDetailView.render().el);
                this.poiDetailView.open();
            });
        },

        renderPois: function () {
            this.poisView.render();

            // add markers on map for each poiView
            _.each(this.poisView.poiViewCollection, function (poiView, indexA) {
                _.each(poiView.markers, function (marker, indexB) {
                    // this.poisView.markers.addLayer(marker);
                    this.poisView.markers[indexA+indexB] = marker;
                }, this);
            }, this);

            // this.poisView.markers.on('click', _.bind(function (e) {
            //     var poiId = e.layer.options.id;
            //     var poi = _.find(this.poisView.poiResultsViewCollection, function (poiResultView) {
            //         return poiResultView.model.id == poiId;
            //     });

            //     this.$resultsContainer.scrollTop(this.$resultsContainer.scrollTop() + poi.$el.position().top);
            // }, this));

            this.poisView.poiLayer.updatePois(this.poisView.markers);
        },

        onMapViewChanged: function () {
            if (this.poisView.poiLayer._clustered === false) {
                this.state.bounds = this.map.getBounds();

                // this.filteredPois = this.pois.filterBy(this.state);

                // // Create a new collection of poi based on filtered pois
                // var newPoisCollection = new atlaas.Collections.PoisCollection(this.filteredPois);
                // // Apply this new collection to our currents pois
                // this.poisView.collection = newPoisCollection;
                // this.poisView.render();

                // this.poisView.markers.off('click');
                // this.poisView.markers.clearLayers();

                this.poisView.fitToBounds(this.state);
            }
        },

        onMapZoomChanged: function () {
            if (this.poisView.poiLayer._clustered === false) {
                this.filteredPois = this.pois.filterBy(this.state);

                // // Create a new collection of poi based on filtered pois
                var newPoisCollection = new atlaas.Collections.PoisCollection(this.filteredPois);
                // // Apply this new collection to our currents pois
                this.poisView.collection = newPoisCollection;
                this.poisView.render();

                // this.poisView.markers.off('click');
                // this.poisView.markers.clearLayers();
            }
        },

        initMenu: function () {
            var categories = new atlaas.Collections.CategoriesCollection();

            var categoriesView = new atlaas.Views.Map.CategoriesView({ el: this.$el.find('.results-menu__categories .submenu'), collection: categories, mapState: this.state });

            this.search = new atlaas.Views.Map.SearchView({ el: this.$el.find('.results-menu__search'), mapState: this.state });

            this.listenTo(categoriesView, 'selected', function () {
                this.selectedCategoryHandler(categoriesView.selectedCategories);
            });

            this.$categoriesContainer = this.$el.find('.results-menu__container');
            this.$resultsContainer = this.$categoriesContainer.find('.results-menu__wrapper');
            this.$menuWrapper = this.$categoriesContainer.find('.menu-wrapper');
        },

        selectedCategoryHandler: function (categories) {
            this.state.categories = categories;

            this.filteredPois = this.pois.filterBy(this.state);

            // Create a new collection of poi based on filtered pois
            var newPoisCollection = new atlaas.Collections.PoisCollection(this.filteredPois);
            // Apply this new collection to our currents pois
            this.poisView.collection = newPoisCollection;
            this.poisView.render();

            this.poisView.markers.off('click');
            this.poisView.markers.clearLayers();

            this.renderPois();
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
                } 
            });

            TweenLite.fromTo($menuIn, 0.4,
                { 'x': '220px',
                'opacity': '0'},
                { 'x': '0px',
                'opacity': '1',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $currentSubmenu.parent('li').removeClass('subviewopen').addClass('subview');
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
                }
            });

            TweenLite.fromTo($menuIn, 0.4,
                { 'x': '-220px',
                'opacity': '0'},
                { 'x': '0px',
                'opacity': '1',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $parentMenu.removeClass('subview');
                    $('.subviewopen').removeClass('subviewopen');
                    $parentMenu.parent('li').removeClass('subview').addClass('subviewopen');
                    $menuIn.remove();
                }
            });
        },

        clickResultHandler: function (e) {
            e.preventDefault();

            var $result = $(e.target);

            this.$activeResult.removeClass('active');
            this.$activeResult = $result;

            var poiId = $result.attr('href');

            var poi = _.find(this.poisView.poiViewCollection, function(poiView){
                return poiView.model.id == poiId;
            });

            $result.addClass('active');

            this.map.panTo(poi.markers[0].getLatLng());
        },
    });
})();
