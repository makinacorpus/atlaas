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

        filterBy: function (mapState) {
        	return mapState.categories == null ? this.models : this.filter(function (poi) {
        		console.log(poi.get('services'));
                var poi = _.where(poi.get('services'), mapState.categories);

        		return poi.length;
        	});
        }

    });

})();
