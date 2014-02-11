/*global atlaas, Backbone*/

atlaas.Models = atlaas.Models || {};

(function () {
    'use strict';

    atlaas.Models.PoiModel = Backbone.Model.extend({

        url: '',

        title: '',

        lat: '',

        lng: '',

        content: '',

        initialize: function() {
        },

        defaults: {
            lat: '46.883',
            lng: '2.872',
            title: '',
            content: ''
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

})();
