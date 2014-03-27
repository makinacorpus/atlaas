/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // POIs view : this view displays POIs on the map and pois in the result list
    atlaas.Views.Map.PoisView = Backbone.View.extend({
        events: {
        },

        initialize: function () {
            this.poiViewCollection          = [];
            this.poiLayer                   = new L.POILayer();
            this.departments                = undefined;

            // Initialy, display a poi summary
            var query = {
                source: JSON.stringify({
                    "size" : 30,
                    "query" : {
                        "match_all" : {}
                    }
                })
            };

            this.collection.fetch({ data: query });
            this.listenTo(this.collection, "reset", this.render);

            this.loadDepartments();

            this.poiLayer.addTo(this.el);
        },

        render: function () {
            this.poiLayer.clusterDetailLayer.off('click');

            // PoisView
            this.poiViewCollection = _.map(this.collection.models, function (_model) {
                return new atlaas.Views.Map.PoiView({ model: _model });
            });
            
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

        updateDepartments: function (_mapState) {
            var query = {};
            var filtersQuery = {
                "bool" : {
                    "must" : []
                }
            };
            var mapState = typeof _mapState === "undefined" ? { 
                categories: null,
                search: ""
            } : _mapState;

            this.poiLayer.clusterLayer.clearLayers();
            
            if (this.el.hasLayer(this.poiLayer.clusterLayer))
                this.el.removeLayer(this.poiLayer.clusterLayer);

            // If no filter att all
            if (mapState.search == "" && mapState.categories == null) {
                filtersQuery.bool.must.push({ 
                    "match_all": {}
                });
            }

            // If text search
            if (mapState.search != "") {
                filtersQuery.bool.must.push({ 
                    "fuzzy_like_this" : {
                        "fields" : ["titre", "ville"],
                        "like_text" : mapState.search
                    }
                });
            }

            // If category selected
            if (mapState.categories != null) {
                var categoriesQuery = _.map(mapState.categories, function(value, key) {
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

            $.when($.getJSON(atlaas.CONFIG.elasticsearch + '/actions/_search?source=' + encodeURIComponent(JSON.stringify(query))))
            .done(L.Util.bind(function (pois) {
                var terms = {};
                
                _.each(pois.facets.test.terms, function (department) {
                    terms[department.term] = department.count;
                });

                _.each(this.departments.features, function (department) {
                    var lat     = department.geometry.coordinates[0],
                        lng     = department.geometry.coordinates[1],
                        id      = department.properties.CODE_REG,
                        myIcon  = L.divIcon({className: 'regions-cluster-icon', iconSize:null});

                    if(terms[department.properties.CODE_REG]) {
                        myIcon.options.html = '<div><span>'+terms[department.properties.CODE_REG]+'</span></div>';
                        var marker = L.marker([lng, lat], {icon: myIcon});
                        this.poiLayer.clusterLayer.addLayer(marker);
                    }
                }, this);

                this.el.addLayer(this.poiLayer.clusterLayer);
            }, this));
        },

    });

})();
