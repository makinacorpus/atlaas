/*global app, Backbone*/

atlaas.Models = atlaas.Models || {};

(function () {
    'use strict';

    atlaas.Models.CategoryModel = Backbone.Model.extend({

        initialize: function() {
        },

        defaults: {
            title: ''
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            response = response._source;
            response.category = response.enjeu_de_developpement;
            response.id = response.id_service;
            delete response.enjeu_de_developpement;
            delete response.id_service;

            return response;
        }
    });

})();