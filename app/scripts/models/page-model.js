/*global app, Backbone*/

atlaas.Models = atlaas.Models || {};

(function () {
    'use strict';

    atlaas.Models.PageModel = Backbone.Model.extend({

        url: '',

        initialize: function() {
        },

        defaults: {
            name: 'New Page'
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

})();
