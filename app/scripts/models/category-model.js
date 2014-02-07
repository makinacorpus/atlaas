/*global app, Backbone*/

atlaas.Models = atlaas.Models || {};

(function () {
    'use strict';

    atlaas.Models.CategoryModel = Backbone.Model.extend({

        url: '',

        title: '',

        initialize: function() {
        },

        defaults: {
            title: ''
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

})();