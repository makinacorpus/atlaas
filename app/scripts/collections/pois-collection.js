/*global app, Backbone*/

atlaas.Collections = atlaas.Collections || {};

(function () {
    'use strict';

    atlaas.Collections.PoisCollection = Backbone.Collection.extend({

        model: atlaas.Models.PoiModel,

        url: atlaas.CONFIG.elasticsearch + '/actions/_search',

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

        searchBy: function (_filter) {
            var querySize = 30,
                bounds = {},
                query = {},
                filtersQuery = {
                    "bool" : {
                        "must" : []
                    }
                },
                boundsQuery = {};

            // If custom filter submited, extend global filter
            this.options.filter = typeof _filter === "undefined" ? this.options.filter : _.extend(this.options.filter, _filter);

            // If bounds specified, load maximum of pois in bound
            if (this.options.filter.bounds !== null) {
                querySize = 2000;
                bounds = this.convertBoundsToESFormat(this.options.filter.bounds);
                boundsQuery = {
                    "filter": {
                        "geo_bounding_box": {
                            "lieux.location": bounds
                        }
                    }
                }
            }

            // If no filter at all
            if (this.options.filter.search === "" && this.options.filter.categories === null && this.options.filter.actor == "") {
                filtersQuery.bool.must.push({ 
                    "match_all": {}
                });
            }

            // If text search
            if (this.options.filter.search !== "") {
                filtersQuery.bool.must.push({ 
                    "fuzzy_like_this" : {
                        "fields" : ["titre", "ville"],
                        "like_text" : this.options.filter.search
                    }
                });
            }

            // If category selected
            if (this.options.filter.categories !== null) {
                var categoriesQuery = _.map(this.options.filter.categories, function(value, key) {
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
            if (this.options.filter.actor != "") {
                filtersQuery.bool.must.push({ 
                    "term" : { "personnes.id_personne" : this.options.filter.actor }
                });
            }

            query = {
                source: {
                    "size" : querySize,
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

            query = {
                source: JSON.stringify(query.source)
            }


            this.fetch({ data: query });
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
