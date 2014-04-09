/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // POIs view : this view displays POIs on the map and pois in the result list
    atlaas.Views.Map.PoisView = Backbone.View.extend({

        /**
         * Constructor
         * 
         * @param {Object} [options.filter] - Map active pois filters
         */
        initialize: function (options) {
            this.poiViewCollection          = {};
            this.poiLayer                   = new L.POILayer();
            this.departments                = undefined;
            this.departmentsMarkers         = undefined;
            this.filter                     = options.filter;

            this.listenTo(this.collection, "reset", this.render);
            this.listenTo(this.collection, 'add', function (model) {
                this.poiViewCollection[model.id] = new atlaas.Views.Map.PoiView({ model: model });
            });
            this.listenTo(this.collection, 'remove', function (model) {
                delete this.poiViewCollection[model.id];
            });

            // If departments only
            if (this.filter.departments) {
                this.loadDepartments();
                this.poiLayer.addLayer(this.poiLayer.clusterLayer);
            } else {
               var query = this.collection.getFiltersQuery(this.filter);
                this.collection.fetch({ data: query });
            }
        },

        render: function () {
            this.poiLayer.clusterDetailLayer.off('click');
            
            // Empty markers
            var markers = {};

            // add markers on map for each poiView
            _.each(this.poiViewCollection, function (poiView) {
                _.each(poiView.markers, function (marker) {
                    markers[marker.options.id] = marker;
                }, this);
            }, this);

            // Display markers
            this.poiLayer.updatePois(markers);

            return this;
        },

        update: function (_filter) {
            this.filter = _filter;

            // Only update if not on clustered version
            if (this.filter.departments) {
                this.updateDepartments(this.filter);
            } else {
                var query = this.collection.getFiltersQuery(this.filter);
                this.collection.fetch({ data: query });
            }
        },

        loadDepartments: function () {
            var departmentsUrl = 'scripts/helpers/regions.geojson';
            
            $.when($.getJSON(departmentsUrl))
            .done(L.Util.bind(function (_departments) {
                this.departments = _departments;
                this.updateDepartments();
            }, this));
        },

        updateDepartments: function (_filter) {
            var query = this.collection.getFiltersQuery();

            _.each(this.departmentsMarkers, _.bind(function (marker) {
                marker.off('click');
            }, this));

            $.when($.getJSON(atlaas.CONFIG.elasticsearch + '/actions/_search?source=' + encodeURIComponent(JSON.stringify(query))))
            .done(L.Util.bind(function (pois) {
                var terms = {};

                _.each(pois.facets.test.terms, function (department) {
                    terms[department.term] = department.count;
                });

                // Init markers
                if (typeof this.departmentsMarkers === "undefined") {
                    this.departmentsMarkers = {};

                    _.each(this.departments.features, function (department, index) {
                        var lat     = department.geometry.coordinates[0],
                            lng     = department.geometry.coordinates[1],
                            id      = department.properties.CODE_REG,
                            myIcon  = L.divIcon({className: 'regions-cluster-icon', iconSize:null});
                        if(terms[department.properties.CODE_REG]) {
                            myIcon.options.html = '<div><span>'+terms[department.properties.CODE_REG]+'</span></div>';
                            var marker = L.marker([lng, lat], {icon: myIcon});
                            this.departmentsMarkers[index] = marker;
                            this.poiLayer.clusterLayer.addLayer(marker);
                        }
                    }, this);
                } else {
                    // Update markers
                    var newMarkers = {};

                    _.each(this.departments.features, function (department, index) {
                        var lat     = department.geometry.coordinates[0],
                            lng     = department.geometry.coordinates[1],
                            id      = department.properties.CODE_REG,
                            myIcon  = L.divIcon({className: 'regions-cluster-icon', iconSize:null});
                        if(terms[department.properties.CODE_REG]) {
                            myIcon.options.html = '<div><span>'+terms[department.properties.CODE_REG]+'</span></div>';
                            var marker = L.marker([lng, lat], {icon: myIcon});
                            newMarkers[index] = marker;
                        }
                    }, this);

                    // Removing no longer visible markers
                    for (var marker in this.departmentsMarkers) {
                        if (newMarkers[marker] === undefined) {
                            var layer = this.departmentsMarkers[marker];
                            delete this.departmentsMarkers[marker];
                            this.poiLayer.clusterLayer.removeLayer(layer);
                        }
                    }

                    // Adding new markers
                    for (var marker in newMarkers) {
                        if (this.departmentsMarkers[marker] === undefined) {
                            var layer = newMarkers[marker];
                            this.departmentsMarkers[marker] = layer;
                            this.poiLayer.clusterLayer.addLayer(this.departmentsMarkers[marker]);
                        } else {
                            // Markers already on map, update their number
                            this.departmentsMarkers[marker].options.icon.options.html = newMarkers[marker].options.icon.options.html;
                            // Update in the DOM (cause Leaflet doesn't have method for this)
                            $(this.departmentsMarkers[marker]._icon).html(newMarkers[marker].options.icon.options.html);
                        }
                    }
                }

                _.each(this.departmentsMarkers, _.bind(function (marker) {
                    marker.on('click', _.bind(function (e) {
                        this.trigger('zoomTo', e);
                    }, this));
                }, this));
            }, this));
        },

        initPois: function () {
            
        }

    });

})();
