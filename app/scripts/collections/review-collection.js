/*global app, Backbone*/

atlaas.Collections = atlaas.Collections || {};

(function () {
    'use strict';

    atlaas.Collections.ReviewCollection = Backbone.Collection.extend({

        model: atlaas.Models.PoiDetailModel,

        url: atlaas.CONFIG.elasticsearch + '/review/_search',

        parse: function (response, options) {
            return response.hits.hits;
        }

    });

})();
