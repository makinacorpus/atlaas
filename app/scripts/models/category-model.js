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

        parse: function(response, options) {
            response = response._source;
            response.id = response.id_enjeu;
            response.enjeu_de_developpement = response.enjeu;
            delete response.id_enjeu;
            delete response.enjeu;
            console.log(response);
            return response;
        },

        getUsage: function(usageName) {
            return _.find(this.attributes.usages, function(_usage) {
                return _usage.usage == usageName;
            });
        },

        getServices: function(usageName) {
            return this.getUsage(usageName).services;
        }
    });

})();