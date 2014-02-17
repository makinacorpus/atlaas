/*global app, Backbone*/

atlaas.Collections = atlaas.Collections || {};

(function () {
    'use strict';

    atlaas.Collections.PoisCollection = Backbone.Collection.extend({

        model: atlaas.Models.PoiModel,

        url: 'http://elastic.makina-corpus.net/atlaas/actions/_search',

        parse: function (response, options) {
            return response.hits.hits;
        },

        filterBy: function (category) {
        	return category == null ? this.models : this.filter(function (poi) {

                var poi = _.where(poi.get('services'), category);

        		return poi;
        	});
        }

    });

})();
