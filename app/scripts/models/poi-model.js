/*global atlaas, Backbone*/

atlaas.Models = atlaas.Models || {};

(function () {
    'use strict';

    atlaas.Models.PoiModel = Backbone.Model.extend({

        urlRoot: 'http://elastic.makina-corpus.net/atlaas/actions',

        initialize: function() {
        },

        defaults: {
            actions: ''
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            response = response._source;
            response.id = response.id_action;

            delete response.id_action;

            return response;
        }
    });

})();
