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

        defaultState: {
            categories: null,
            bounds: null,
            pos: [46.883, 4],
            zoom: 6,
            search: "",
            actor: ""
        },

        initialize: function () {
            this.filteredPois       = []
            this.poisView           = undefined
            this.poiResultsView     = undefined
            this.searchView         = undefined    
            this.resultsCollection  = undefined
            this.poisCollection     = undefined
            this.currentView        = undefined
        },

        render: function () {
            // Override default params if needed
            if(typeof this.options.state === "undefined") {
                this.options.state = {};
            }

            _.defaults(this.options.state, this.defaultState);

            this.$el.html(this.template({ id:this.options.map }));

            return this;
        },

        // called only after template is rendered cause Leaflet needs an existing DOM element
        initMap: function () {
            this.map = L.map(this.options.map, { maxZoom: 14, minZoom: 3, attributionControl: false, zoom: this.options.state.zoom, center: this.options.state.pos });

            L.control.attribution({position: 'bottomleft'}).addTo(this.map);
            L.control.locate().addTo(this.map);

            L.tileLayer('http://{s}.livembtiles.makina-corpus.net/makina/osmlight-france/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            this.initPois();
            this.initMenu();

            this.poisView.poiLayer.addTo(this.map);

            this.map.on('moveend', this.onMapViewChanged, this);
            this.map.on('zoomend', this.onMapZoomChanged, this);
        },

        initPois: function () {
            this.poisCollection = new atlaas.Collections.PoisCollection({ filter: this.options.state });

            // If not clustered
            if (!this.map.getZoom() < L.POILayer.CLUSTER_THRESHOLD) {
                this.options.state.bounds = this.map.getBounds().pad(0.3);
            }

            this.poisView = new atlaas.Views.Map.PoisView({ collection: this.poisCollection, el: this.map, filter: this.options.state });


            this.listenTo(this.poisView.collection, 'sync', function () {
                if (!this.poisView.clustered) {
                    this.renderPois();
                }
                this.renderPoisResults();
            });

            this.listenTo(this.poisView.collection, 'reset', function () {
                this.renderPoisResults();
            });

            this.listenTo(this.poisView, 'zoomTo', function (marker) {
                this.map.setZoomAround(marker.latlng, 8);
            });
        },

        initMenu: function () {
            this.categoriesCollection    = new atlaas.Collections.CategoriesCollection();
            this.categoriesView          = new atlaas.Views.Map.CategoriesView({ el: this.$el.find('.results-menu__categories .submenu'), collection: this.categoriesCollection, mapState: this.options.state });

            this.resultsCollection      = new atlaas.Collections.ResultsCollection();
            this.searchView             = new atlaas.Views.Map.SearchView({ el: this.$el.find('.results-menu__search'), collection: this.resultsCollection, state: this.options.state.search });
            this.poiResultsView         = new atlaas.Views.Map.PoiResultsView({ collection: this.resultsCollection });

            this.$categoriesContainer   = this.$el.find('.results-menu__container');
            this.$resultsContainer      = this.$categoriesContainer.find('.results-menu__wrapper');
            this.$menuWrapper           = this.$categoriesContainer.find('.menu-wrapper');

            // Event handlers
            this.listenTo(this.categoriesView, 'selected', function () {
                this.selectedCategoryHandler(this.categoriesView.selectedCategories);
            });

            this.listenTo(this.poiResultsView, 'openResult', function (poi) {
                atlaas.router.navigate("map/actions/" + poi.model.id);
                this.showPoiDetail(poi.model.id);

                var poiView = _.find(this.poisView.poiViewCollection, function(_poiView){
                    return _poiView.model.id == poi.model.get('id');
                });

                this.map.panToOffset( poiView.markers[0].getLatLng(), [0, -(atlaas.height*0.4)] );
            });

            this.listenTo(this.poiResultsView, 'panToPoi', function (poiId) {
                var poiView = _.find(this.poisView.poiViewCollection, function(_poiView){
                    return _poiView.model.id == poiId;
                });

                if (poiView.markers[0].__parent || poiView.markers[0]._icon) {
                    this.poisView.poiLayer.clusterDetailLayer.zoomToShowLayer(poiView.markers[0], _.bind(function() {
                        this.showPopup(poiId, poiView.markers[0]);
                    }, this));
                } else {
                    this.listenToOnce(this.poisView, 'poisRendered', function () {
                        this.poisView.poiLayer.clusterDetailLayer.zoomToShowLayer(poiView.markers[0], _.bind(function() {
                            this.showPopup(poiId, poiView.markers[0]);
                        }, this));
                    });

                    this.map.setView(poiView.markers[0].getLatLng(), 14);
                }
            });

            this.listenTo(this.searchView, 'search', function (query) {
                this.options.state.search = query;

                this.updatePoisState();
            });
        },

        showPopup: function (poiId, marker) {
            var currentPoi = this.poisView.collection.get(poiId);
            var popupContent = $('<div><h3 class="title">'+currentPoi.get('titre')+'</h3><h4>'+currentPoi.get('lieux')[0].nom+'</h4><a href="'+poiId+'">En savoir plus</a></div>');
            marker.bindPopup(popupContent[0], { autoPan: false });
            marker.openPopup();

            $(marker.getPopup().getContent()).find('a').one('click', L.Util.bind(function (e) {
                e.preventDefault();

                atlaas.router.navigate("map/actions/" + poiId);

                if (typeof this.poiDetailView !== 'undefined') {
                    this.poiDetailView.close();
                };
                
                this.showPoiDetail(poiId);

                marker.closePopup();
            }, this));
        },

        renderPois: function () {
            this.poisView.render();

            this.poisView.poiLayer.clusterDetailLayer.on('click', _.bind(function (e) {
                this.showPopup(e.layer.options.id, e.layer);

                var poiId = e.layer.options.id;

                if (typeof this.poiResultsView.viewCollection[poiId] === "undefined") {
                    this.poiResultsView.collection.add(this.poisView.collection.get(poiId));
                }

                var poi = this.poiResultsView.viewCollection[poiId];

                this.$resultsContainer.scrollTop(this.$resultsContainer.scrollTop() + poi.$el.position().top);
                // poi.$el.find('.results-menu__item').click();
            }, this));
        },

        renderPoisResults: function () {
            if (this.poiResultsView.syncResults) {
                // never display more than the 30 first results in the list (user must zoom/search to acurate)
                this.poiResultsView.collection.set(this.poisView.collection.models.slice(0, 30));
                return;
            };

            this.poiResultsView.render();
        },

        showPoiDetail: function (action_id) {
            var poiDetailModel = new atlaas.Models.PoiDetailModel({ id: action_id });

            this.poiDetailView = new atlaas.Views.Map.PoiDetailView({ model: poiDetailModel });

            this.listenTo(poiDetailModel, 'sync', function () {
                this.$el.append(this.poiDetailView.render().el);
                this.currentView = this.poiDetailView;
                this.poiDetailView.open();
            });

            this.listenToOnce(this.poiDetailView, 'filtered', function(service) {
                this.options.state.categories = service;

                this.updatePoisState();
            });

            this.resetPoisType();
        },

        selectedCategoryHandler: function (categories) {
            console.log(categories);
            this.options.state.categories = categories;

            $('.clear-bt').show();

            this.updatePoisState();
        },

        clearBtHandler: function (e) {
            e.preventDefault();

            $('.clear-bt').hide();
            
            this.resetFilters();
        },

        // Reset filters : categories, search,
        resetFilters: function () {
            this.options.state.categories = null;

            this.updatePoisState();
        },

        // Reset pois type to default (actions pois)
        resetPoisType: function () {
            this.options.state.actor = '';
        },

        zoomToPoisBounds: function () {
            this.listenToOnce(this.poisView.collection, 'sync', function () {
                this.map.fitBounds(this.poisView.collection.bounds);
            });

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
            this.options.state.bounds = this.map.getBounds().pad(0.3);
            this.updatePoisState();
        },

        onMapZoomChanged: function () {
            var clustered = this.map.getZoom() < L.POILayer.CLUSTER_THRESHOLD;

            this.poisView.clustered = clustered;
        },

        updatePoisState: function () {
            this.options.state.zoom = this.map.getZoom();
            this.options.state.center = [this.map.getCenter().lat.toFixed(3), this.map.getCenter().lng.toFixed(3)];

            // update url with params
            var regex = /#(.*)\?/;
            var currentRoute = Backbone.history.location.hash;

            // If url has already params
            if (regex.test(Backbone.history.location.hash)) {
                currentRoute = regex.exec(currentRoute)[1];
            }

            // Construct url params defaults
            var urlFilters = {
                zoom:   this.options.state.zoom,
                pos:    this.options.state.center
            }

            // Add optional params
            if (this.options.state.search !== '') {
                _.extend(urlFilters, { search: this.options.state.search });
            };

            if (this.options.state.categories !== null) {
                if (typeof this.options.state.categories.enjeu_de_developpement !== 'undefined') {
                    var enjeu = this.categoriesCollection.findWhere({ 'enjeu_de_developpement' : this.options.state.categories.enjeu_de_developpement });
                    _.extend(urlFilters, { e: enjeu.id });
                };

                if (typeof this.options.state.categories.usage !== 'undefined') {
                    var usageId;
                    var that = this;
                    this.categoriesCollection.each(function(usage) {
                        _.each(usage.get('usages'), function(_usage, key) {
                            if (_usage.usage === that.options.state.categories.usage) {
                                usageId = key;
                                return;
                            }
                        });
                    });
                    _.extend(urlFilters, { u: usageId });
                };

                if (typeof this.options.state.categories.service !== 'undefined') {
                    var serviceId;
                    var that = this;
                    this.categoriesCollection.each(function(usage) {
                        _.each(usage.get('usages'), function(_usage) {
                            _.each(_usage.services, function(_service) {
                                if (_service.service === that.options.state.categories.service) {
                                    serviceId = _service.id_service;
                                    return;
                                }
                            });
                        });
                    });
                    _.extend(urlFilters, { s: serviceId });
                };
            }

            var route = atlaas.router.toFragment(currentRoute, urlFilters);

            atlaas.router.navigate(route, { replace: true });

            // Update map pois
            this.poisView.update(this.options.state);
            
            // Remove right menu from map bounds for performances
            // this.options.state.bounds = this.map.getBoundsWithRightOffset(340);
        }
    });
})();
