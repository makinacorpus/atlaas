/*global app, Backbone*/

atlaas.Collections = atlaas.Collections || {};

(function () {
    'use strict';

    atlaas.Collections.PoisCollection = Backbone.Collection.extend({

        model: atlaas.Models.PoiModel,

        url: atlaas.CONFIG.elasticsearch + '/actions/_search',

        parse: function (response, options) {
            return response.hits.hits;
        },

        searchBy: function (mapState) {
            var bounds = this.convertBoundsToESFormat(mapState.bounds);
            var query = {};
            var filtersQuery = {
                "bool" : {
                    "must" : []
                }
            };

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
                source: JSON.stringify({
                    "size" : 1000,
                    "query": {
                        "filtered": {
                            "query": filtersQuery
                        }
                    },
                    "filter": {
                        "geo_bounding_box": {
                            "lieux.location": bounds
                        }
                    }
                })
            };

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
