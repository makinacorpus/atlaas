/*global app, Backbone*/

atlaas.Collections = atlaas.Collections || {};

(function () {
    'use strict';

    atlaas.Collections.PoisCollection = Backbone.Collection.extend({

        model: atlaas.Models.PoiModel,

        url: atlaas.CONFIG.elasticsearch + '/actions/_search',

        /**
         * Constructor
         * 
         * @param {Object} [options.filter] - Map active pois filters
         */
        initialize: function (options) {
            this.options = options || {};

            this.bounds = undefined;

            return this;
        },

        parse: function (response, options) {
            var southWest = L.latLng(response.facets.lat.min, response.facets.lon.min),
                northEast = L.latLng(response.facets.lat.max, response.facets.lon.max);

            this.bounds = L.latLngBounds(southWest, northEast);

            return response.hits.hits;
        },

        getFiltersQuery: function (_filter, target) {
            var bounds = {},
                query = {},
                filtersQuery = {
                    "bool" : {
                        "must" : []
                    }
                },
                boundsQuery = {};

            // If custom filter submitted, extend global filter
            this.options.filter = typeof _filter === "undefined" ? this.options.filter : _.extend(this.options.filter, _filter);

            // If no filter at all
            if (this.options.filter.search === "" && this.options.filter.categories === null && this.options.filter.actor == "") {
                filtersQuery.bool.must.push({ 
                    "match_all": {}
                });
            }

            // If text search
            if (this.options.filter.search !== "") {
                filtersQuery.bool.must.push({ 
                    "match" : {
                        "_all" : this.options.filter.search
                    }
                });
            }

            // If category selected
            if (this.options.filter.categories !== null) {
                var categoriesQuery = _.map(this.options.filter.categories, function(value, key) {
                    var object = {};
                    object['services.'+key] = value;
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
            if (this.options.filter.actor != "") {
                filtersQuery.bool.must.push({ 
                    "term" : { "personnes.id_personne" : this.options.filter.actor }
                });
            }

            // If departments
            if (typeof target !== "undefined" && target === "departments") {
                return query = {
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
            } else {
                query = {
                    source: {
                        "size" : 100000,
                        "query": {
                            "filtered": {
                                "query": filtersQuery
                            }
                        },
                        "partial_fields" : {
                            "partial" : {
                                "include" : ["id_action", "titre", "lieux.nom", "lieux.lat", "lieux.lon"]
                            }
                        },
                        "facets" : {
                            "lat" : {
                               "statistical" : {
                                  "field" : "lieux.lat"
                               }
                            },
                            "lon" : {
                               "statistical" : {
                                  "field" : "lieux.lon"
                               }
                            }
                        }
                    }
                };

                _.extend(query.source, boundsQuery);

                return query = {
                    source: JSON.stringify(query.source)
                }
            }
        },

        convertBoundsToESFormat: function (Lbounds) {
        	var newBoundsFormat = {
        		top_left: {
                    lat: 0,
                    lon: 0
                },
                bottom_right: {
                    lat: 0,
                    lon: 0
                }
            }
            
            newBoundsFormat.top_left.lat = Lbounds.getNorthWest().lat;
            newBoundsFormat.top_left.lon = Lbounds.getNorthWest().lng;
            newBoundsFormat.bottom_right.lat = Lbounds.getSouthEast().lat;
            newBoundsFormat.bottom_right.lon = Lbounds.getSouthEast().lng;

            return newBoundsFormat;
        }

    });

})();
