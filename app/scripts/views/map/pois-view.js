/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // POIs view : this view displays POIs on the map and pois in the result list
    atlaas.Views.Map.PoisView = Backbone.View.extend({

        initialize: function (options) {
            this.poiViewCollection          = [];
            this.poiLayer                   = new L.POILayer();
            this.departments                = undefined;
            this.departmentsMarkers         = undefined;
            this.filter                     = options.filter;

            this.listenTo(this.collection, "reset", this.render);
            this.listenTo(this.collection, 'add', function (model) {
                this.poiViewCollection.push(new atlaas.Views.Map.PoiView({ model: model }));
            });
            this.listenTo(this.collection, 'destroy', function (model) {
                delete this.poiViewCollection[model];
            });

            this.loadDepartments();

            this.poiLayer.addLayer(this.poiLayer.clusterLayer);
        },

        render: function () {
            this.poiLayer.clusterDetailLayer.off('click');

            // PoisView
            // this.poiViewCollection = _.map(this.collection.models, function (_model) {
            //     return new atlaas.Views.Map.PoiView({ model: _model });
            // });
            
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

        loadDepartments: function () {
            var departmentsUrl = 'scripts/helpers/regions.geojson';
            
            $.when($.getJSON(departmentsUrl))
            .done(L.Util.bind(function (_departments) {
                this.departments = _departments;
                this.updateDepartments();
            }, this));
        },

        updateDepartments: function (_filter) {
            var query = {};
            var filtersQuery = {
                "bool" : {
                    "must" : []
                }
            };

            // If custom filter submited, extend global filter
            this.filter = typeof _filter === "undefined" ? this.filter : _.extend(this.filter, _filter);

            // If no filter at all
            if (this.filter.search == "" && this.filter.categories == null && this.filter.actor == "") {
                filtersQuery.bool.must.push({ 
                    "match_all": {}
                });
            }

            // If text search
            if (this.filter.search != "") {
                filtersQuery.bool.must.push({ 
                    "fuzzy_like_this" : {
                        "fields" : ["titre", "ville"],
                        "like_text" : this.filter.search
                    }
                });
            }

            // If category selected
            if (this.filter.categories != null) {
                var categoriesQuery = _.map(this.filter.categories, function(value, key) {
                    var object = {};
                    object[key] = value;
                    return {
                        "match_phrase" : object
                    }
                });

                filtersQuery.bool.must.push({ 
                    "bool" : {
                        "must" : categoriesQuery
                    }
                });
            }

            // If actor filter
            if (this.filter.actor != "") {
                filtersQuery.bool.must.push({ 
                    "term" : { "personnes.id_personne" : this.filter.actor }
                });
            }

            query = {
                "size" : 0,
                "query": {
                    "filtered": {
                        "query": filtersQuery
                    }
                },
                "facets": {
                    "test": {
                        "terms": {
                            "size": 100,
                            "script": "doc['lieux.region'].value"
                        },
                        "global": false
                    }
                }
            };

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
