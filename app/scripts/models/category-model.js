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

        getUsages: function(usage) {
            return _.map(this.get('usages'), function(usage) {
                console.log(usage);
                return usage;
            });
        }
    });

})();