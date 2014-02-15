/*global app, Backbone*/

atlaas.Models = atlaas.Models || {};

(function () {
    'use strict';

    atlaas.Models.CategoryModel = Backbone.Model.extend({

        initialize: function() {
        },

        defaults: {
            title: '',
            selected: false
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            response = response._source;
            response.id = response.id_service;
            delete response.id_service;

            return response;
        }
    });

})();