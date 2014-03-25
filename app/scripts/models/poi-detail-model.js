/*global atlaas, Backbone*/

atlaas.Models = atlaas.Models || {};

(function () {
    'use strict';

    atlaas.Models.PoiDetailModel = Backbone.Model.extend({

        urlRoot: atlaas.CONFIG.elasticsearch + '/actions',

        initialize: function() {
        },

        defaults: {
            actions: ''
        },

        schema: {
            titre:      'Text',
            sous_titre: 'Text',
            synthese:   'TextArea',
            date:       'Date',
            liens:      'Text'
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            response = response._source;
            response.id = response.id_action;

            // TODO : clean it server side
            _.each(response.services, function (service) {
                service.enjeu_de_developpement = service.enjeu_de_developpement.substring(3);
                service.usage = service.usage.substring(3);
            });

            delete response.id_action;

            return response;
        }
    });

})();
