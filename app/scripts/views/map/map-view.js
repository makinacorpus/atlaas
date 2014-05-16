/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    // Map view : top view of the map elements
    atlaas.Views.Map.MapView = Backbone.View.extend({
        events: {
            'click .map-menu__bt--categories': 'categoriesBtHandler',
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
            this.categoriesView          = new atlaas.Views.Map.CategoriesView({ el: this.$el.find('.menu-categories'), collection: this.categoriesCollection, mapState: this.options.state });

            this.resultsCollection      = new atlaas.Collections.ResultsCollection();
            this.searchView             = new atlaas.Views.Map.SearchView({ el: this.$el.find('.map-menu__search'), collection: this.resultsCollection, state: this.options.state.search });
            this.poiResultsView         = new atlaas.Views.Map.PoiResultsView({ collection: this.resultsCollection });

            this.$resultsContainer      = this.$el.find('.results');

            // Event handlers
            this.listenTo(this.categoriesView, 'selected', function () {
                this.selectedCategoryHandler(this.categoriesView.selectedCategories);
            });

            this.listenToOnce(this.categoriesCollection, 'sync', function () {
                if (this.options.state.categories === null && typeof this.options.state.a !== 'undefined' && typeof this.options.state.e !== 'undefined' || typeof this.options.state.u !== 'undefined' || typeof this.options.state.s !== 'undefined') {
                    this.options.state.categories = {};
                }

                if (typeof this.options.state.a !== 'undefined') {
                    var axe = this.categoriesCollection.get(this.options.state.a);
                    _.extend(this.options.state.categories, { axe: axe.get('axe') });
                }

                if (typeof this.options.state.e !== 'undefined') {
                    var enjeu = this.categoriesCollection.get(this.options.state.e);
                    _.extend(this.options.state.categories, { enjeu: enjeu.get('enjeu_de_developpement') });
                }

                if (typeof this.options.state.u !== 'undefined') {
                    var usageName;
                    var that = this;
                    this.categoriesCollection.each(function(usage) {
                        _.each(usage.get('usages'), function(_usage, key) {
                            if (key === this.options.state.u) {
                                usageName = _usage.usage;
                                return;
                            }
                        });
                    });
                    _.extend(this.options.state.categories, { usages: usageName });
                }

                if (typeof this.options.state.s !== 'undefined') {
                    var serviceName;
                    var that = this;
                    this.categoriesCollection.each(function(usage) {
                        _.each(usage.get('usages'), function(_usage) {
                            _.each(_usage.services, function(_service) {
                                if (_service.id_service === this.options.state.s) {
                                    serviceName = _service.service;
                                    return;
                                }
                            });
                        });
                    });
                    _.extend(this.options.state.categories, { usages: serviceName });
                }
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

            this.listenTo(this.poiDetailView, 'filtered', function(category) {
                this.options.state.categories = category;

                this.updatePoisState();
            });

            this.resetPoisType();
        },

        selectedCategoryHandler: function (categories) {
            this.options.state.categories = categories;

            this.addFilter(_.values(categories));

            this.updatePoisState();
        },

        clearBtHandler: function (e) {
            e.preventDefault();

            $('.clear-bt').hide();
            
            this.resetFilters();
        },

        resetFilters: function () {
            this.options.state.categories = null;
            this.categoriesView.reset();
            this.$resultsContainer.removeClass('hasFilter');
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

        addFilter: function (filter) {
            if (typeof this.activeFilter !== 'undefined') {
                this.activeFilter.remove();
            };

            this.activeFilter = new atlaas.Views.Map.ActiveFilterView({ filter: filter });
            this.$resultsContainer.before(this.activeFilter.render().el).addClass('hasFilter');

            this.listenToOnce(this.activeFilter, 'activeFilterRemoved', function() {
                this.resetFilters();
            });
        },

        onMapViewChanged: function () {
            this.options.state.bounds = this.map.getBounds().pad(0.3);
        },

        onMapZoomChanged: function () {
            var clustered = this.map.getZoom() < L.POILayer.CLUSTER_THRESHOLD;

            if(this.poisView.clustered != clustered) {
                this.poisView.clustered = clustered;
                this.updatePoisState();
            }
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
                if (typeof this.options.state.categories.axe !== 'undefined') {
                    var axe = this.categoriesCollection.findWhere({ 'axe' : this.options.state.categories.axe });
                    _.extend(urlFilters, { a: axe.id });
                }

                if (typeof this.options.state.categories.enjeu !== 'undefined') {
                    var enjeuId;
                    var that = this;
                    this.categoriesCollection.each(function(axe) {
                        _.each(axe.get('enjeux'), function(enjeu, key) {
                            if (enjeu.enjeu === that.options.state.categories.enjeu) {
                                enjeuId = key;
                                return;
                            }
                        });
                    });
                    _.extend(urlFilters, { e: enjeuId });
                }

                if (typeof this.options.state.categories.usage !== 'undefined') {
                    var usageId;
                    var that = this;
                    this.categoriesCollection.each(function(axe) {
                        _.each(axe.get('enjeux'), function(enjeu) {
                            _.each(enjeu.usages, function(usage, key) {
                                if (usage.usage === that.options.state.categories.usage) {
                                    usageId = key;
                                    return;
                                }
                            });
                        });
                    });
                    _.extend(urlFilters, { u: usageId });
                }

                if (typeof this.options.state.categories.service !== 'undefined') {
                    var serviceId;
                    var that = this;
                    this.categoriesCollection.each(function(axe) {
                        _.each(axe.get('enjeux'), function(enjeu) {
                            _.each(enjeu.usages, function(usage) {
                                _.each(usage.services, function(_service) {
                                    if (_service.service === that.options.state.categories.service) {
                                        serviceId = _service.id_service;
                                        return;
                                    }
                                });
                            });
                        });
                    });
                    _.extend(urlFilters, { s: serviceId });
                }
            }

            var route = atlaas.router.toFragment(currentRoute, urlFilters);

            atlaas.router.navigate(route, { replace: true });

            // Update map pois
            this.poisView.update(this.options.state);
            
            // Remove right menu from map bounds for performances
            // this.options.state.bounds = this.map.getBoundsWithRightOffset(340);
        },

        categoriesBtHandler: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var $catBt = $(e.currentTarget);

            if ($catBt.hasClass('open')) {
                this.categoriesView.close();
                $(document).off('click.menu');
            } else {
                this.categoriesView.open();

                $(document).off('click.menu').on('click.menu', _.bind(function(e) {
                    if(this.categoriesView.$el.has(e.target).length === 0) {
                        this.categoriesView.close();
                        $catBt.toggleClass('open');
                        $(document).off('click.menu');
                    }
                }, this));
            }

            $catBt.toggleClass('open');
        }
    });
})();
