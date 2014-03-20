/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    // Map view : top view of the map elements
    atlaas.Views.Map.MapView = Backbone.View.extend({
        events: {
            'click .submenu__item'          : 'openMenu',
            'click .submenu__item--back'    : 'closeMenu',
            'click .clear-bt'               : 'clearBtHandler',
        },

        template: JST['app/scripts/templates/map-view.ejs'],

        attributes: { id: 'map-container', class: 'container' },

        state: { 
            categories: null,
            bounds: {}
        },

        initialize: function () {
            this.filteredPois   = []
        },

        render: function () {
            this.$el.html(this.template({ id:this.options.map }));

            this.initMenu();

            return this;
        },

        // called only when template is rendered cause Leaflet needs a DOM element
        initMap: function () {
            this.map = L.map(this.options.map, { maxZoom: 14, minZoom: 3, attributionControl: false }).setView([46.883, 4], 6);

            L.control.attribution({position: 'bottomleft'}).addTo(this.map);
            L.control.locate().addTo(this.map);

            L.tileLayer('http://{s}.livembtiles.makina-corpus.net/makina/osmlight-france/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            this.initPois();

            this.currentCoords = [];
            this.currentZoom = 10;

            this.map.on('moveend', this.onMapViewChanged, this);
        },


        initPois: function () {
            var pois = new atlaas.Collections.PoisCollection();

            this.poisView = new atlaas.Views.Map.PoisView({ collection: pois });

            this.poisView.poiLayer.addTo(this.map);

            this.listenTo(this.poisView.collection, 'sync', function () {
                if (typeof this.state.categories !== 'null') {
                    this.filteredPois = this.poisView.collection.filterBy(this.state.categories);
                    this.poisView.collection.set(this.filteredPois);
                };

                this.renderPois();
            });

            // Event handlers
            this.listenTo(this.poisView, 'openResult', function (poi) {
                this.showPoiDetail(poi.model);

                var poiView = _.find(this.poisView.poiViewCollection, function(_poiView){
                    return _poiView.model.id == poi.model.get('id');
                });

                this.map.panToOffset( poiView.markers[0].getLatLng(), [0, -(atlaas.height*0.4)] );
            });

            this.listenTo(this.poisView, 'panToPoi', function (poi) {
                var zoom = this.map.getZoom() > 8 ? this.map.getZoom() : 8;
                this.map.setView(poi.markers[0].getLatLng(), zoom);
            });
        },

        renderPois: function () {
            this.poisView.render();

            this.poisView.poiLayer._clusterDetailLayer.on('click', _.bind(function (e) {
                var currentMarkerId = e.layer.options.id;
                var currentMarker = this.poisView.collection.get(currentMarkerId);
                var popupContent = $('<div><h3 class="title">'+currentMarker.get('titre')+'</h3><h4>'+currentMarker.get('lieux')[0].nom+'</h4><a href="'+currentMarkerId+'">En savoir plus</a></div>');
                var popup = e.layer;
                popup.bindPopup(popupContent[0]);
                popup.openPopup();

                $(popup.getPopup().getContent()).find('a').one('click', L.Util.bind(function (e) {
                    e.preventDefault();

                    this.showPoiDetail(currentMarker);

                    popup.closePopup();
                }, this));

                var poiId = e.layer.options.id;
                var poi = _.find(this.poisView.poiResultsViewCollection, function (poiResultView) {
                    return poiResultView.model.id == poiId;
                });

                if (typeof poi != 'undefined') {
                    this.$resultsContainer.scrollTop(this.$resultsContainer.scrollTop() + poi.$el.position().top);
                };                  
            }, this));
        },

        showPoiDetail: function (model) {
            if (typeof this.poiDetailView != 'undefined') {
                if (this.$el.find(this.poiDetailView.el).length != 0 && this.poiDetailView.model == model) return;
                this.poiDetailView.close();
            };

            this.poiDetailView = new atlaas.Views.Map.PoiDetailView({ model: model });
            this.$el.append(this.poiDetailView.render().el);
            this.poiDetailView.open();
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

            $('.clear-bt').show();

            this.updatePoisState();
        },

        clearBtHandler: function (e) {
            e.preventDefault();

            $('.clear-bt').hide();
            
            this.resetFilters();
        },

        resetFilters: function () {
            this.state = { categories: null, bounds: [] };

            this.updatePoisState();
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

        onMapViewChanged: function () {
            this.updatePoisState();
        },

        updatePoisState: function () {
            if (this.poisView.poiLayer._clustered) {
                return;
            }
            // Remove right menu from map bounds for performances
            this.state.bounds = this.map.getBoundsWithRightOffset(340);

            this.poisView.collection.fitToBounds(this.state);
        }

    });
})();
