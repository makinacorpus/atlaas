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
            titre:      { type: 'Text', validators: ['required'] },
            sous_titre: 'Text',
            date:       { type: 'Date', validators: ['required'] },
            actions:    { type: 'TextArea', validators: ['required'] },
            synthese:   'TextArea',
            outils:     'Text',
            prestataires:'Text',
            recommandations: 'Text',
            resultats:  'TextArea',
            liens:      'Text',
            personnes:  { type: 'List', itemType: 'Object', subSchema: {
                nom: 'Text',
                titre: 'Text'    
            } },
            lieux: { type: 'List', itemType: 'Object', validators: ['required'], subSchema: {
                nom: 'Text',
                adresse: { type: 'Text', validators: ['required'] },
                departement: 'Number',
                region: 'Number',
                ville: 'Text',
                code_postal: 'Number',
                telephone: 'Number',
                location: { type: 'Object', validators: ['required'], subSchema: {
                    lat: 'Number',
                    lon: 'Number'
                }},
                type: { type: 'Select', options: ['Ville / Village', 'autre'] }
            } }
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options) {
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
