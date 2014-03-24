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

        filterBy: function (categories) {
        	return categories == null ? this.models : this.filter(function (poi) {
                var poi = _.where(poi.get('services'), categories);
        		return poi.length;
        	});
        },

        searchBy: function (mapState) {
            var bounds = this.convertBoundsToESFormat(mapState.bounds);
            var query = {};

            if (mapState.search != "") {
                query = {
                    source: JSON.stringify({
                        "size" : 300,
                        "query": {
                            "filtered": {
                                "query": {
                                    "fuzzy_like_this" : {
                                        "fields" : ["titre", "ville"],
                                        "like_text" : mapState.search,
                                        "max_query_terms" : 12
                                    }
                                }
                            }
                        },
                        "filter": {
                            "geo_bounding_box": {
                                "lieux.location": bounds
                            }
                        }
                    })
                };
            } else {
                query = {
                    source: JSON.stringify({
                        "size" : 300,
                        "query": {
                            "filtered": {
                                "query": {
                                    "match_all": {}
                                }
                            }
                        },
                        "filter": {
                            "geo_bounding_box": {
                                "lieux.location": bounds
                            }
                        }
                    })
                };
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
