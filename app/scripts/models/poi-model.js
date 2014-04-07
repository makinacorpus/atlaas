/*global atlaas, Backbone*/

atlaas.Models = atlaas.Models || {};

(function () {
    'use strict';

    atlaas.Models.PoiModel = Backbone.Model.extend({

        urlRoot: atlaas.CONFIG.elasticsearch + '/actions',

        initialize: function() {
        },

        defaults: {
            actions: ''
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options) {
            response = response.fields.partial;
            response.id = response.id_action;

            delete response.id_action;

            return response;
        },

        toCSV: function() {
            var data = this.model.toJSON();
            
            JSONtoCSV.toCSV({
                data: data
            }, function(err, csv) {
                console.log(csv);
            });
        }
    });

})();
