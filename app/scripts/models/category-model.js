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
            response.id = response.id_axe;
            delete response.id_axe;

            return response;
        },

        getEnjeu: function(enjeuName) {
            return _.find(this.attributes.enjeux, function(_enjeu) {
                return _enjeu.enjeu == enjeuName;
            });
        },

        getUsage: function(enjeuName, usageName) {
            return _.find(this.getEnjeu(enjeuName).usages, function(_usage) {
                return _usage.usage == usageName;
            });
        },

        getServices: function(enjeuName, usageName) {
            return this.getUsage(enjeuName, usageName).services;
        }
    });

})();