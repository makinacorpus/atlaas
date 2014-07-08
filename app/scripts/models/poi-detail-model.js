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
            sous_titre: { type: 'Text', title: 'Sous-titre' },
            date:       { type: 'Date', validators: ['required'] },
            actions:    { type: 'TextArea', validators: ['required'] },
            synthese:   { type: 'TextArea', title: 'Synthèse' },
            outils:     'Text',
            prestataires:'Text',
            recommandations: 'Text',
            resultats:  { type: 'TextArea', title: 'Résultats' },
            liens:      'Text',
            personnes:  { type: 'List', itemType: 'Object', subSchema: {
                nom: { validators: ['required', 'required'] },
                titre: { validators: ['required'] },
                courriel: { validators: ['required', 'email'] },
                id_personne: { type: 'Hidden'}   
            } },
            lieux: { type: 'List', itemType: 'Object', validators: ['required'], subSchema: {
                nom: 'Text',
                adresse: { type: 'Text', validators: ['required'] },
                departement: { title: 'Département', validators: ['required', { type: 'regexp', regexp: /^[0-9]+$/, message: 'Doit être un entier.'}]},
                ville: { validators: ['required']},
                code_postal: { title: 'Code postal', validators: ['required', { type: 'regexp', regexp: /^[0-9]+$/, message: 'Doit être un entier.'}]},
                telephone: { type: 'Text', title: 'Téléphone' },
                location: { type: 'Object', title: 'Localisation', validators: ['required'], subSchema: {
                    lat: { validators: ['required',  { type: 'regexp', regexp: /^[-+]?[0-9]*\.?[0-9]+$/, message: 'Doit être un nombre à virgule.'}]} ,
                    lon: { validators: ['required',  { type: 'regexp', regexp: /^[-+]?[0-9]*\.?[0-9]+$/, message: 'Doit être un nombre à virgule.'}]} 
                }},
                type: { type: 'Select', options: ['Ville / Village', 'autre'] },
                id_lieu: { type: 'Hidden'}
            } }
        },

        validate: function(attrs, options) {
            var errs = {};

            if (attrs.lieux.length > 1) errs.lieux = 'Restreint à un lieux précis';
            if (attrs.lieux.length == 0) errs.lieux = 'Requis';
            if (attrs.personnes.length == 0) errs.personnes = 'Requis';

            if (!_.isEmpty(errs)) return errs;
        },

        parse: function(response, options) {
            var source = response;
            response = response._source;
            response.id = response.id_action||source._id;

            // TODO : clean it server side

            _.each(response.services, function (service) {
                if(!(_.isNaN(service.axe.substring(1)))){
                    service.axe = service.axe.substring(3);
                    service.enjeu = service.enjeu.substring(3);
                    service.usage = service.usage.substring(3);
                }
            });

            delete response.id_action;

            return response;
        },

        toCSV: function(callback) {
            var data = [this.toJSON()];
            JSONtoCSV.toCSV({
                data: data,
                fields: [
                    {
                        name: 'titre',
                        label: 'Titre'
                    },
                    {
                        name: 'sous_titre',
                        label: 'Sous titre'
                    },
                    {
                        name: 'date',
                        label: 'Date'
                    },
                    {
                        name: 'actions',
                        label: 'Actions'
                    },
                    {
                        name: 'synthese',
                        label: 'Synthèse'
                    },
                    {
                        name: 'outils',
                        label: 'Outils'
                    },
                    {
                        name: 'prestataires',
                        label: 'Prestataires'
                    }
                ]
            }, function(err, csv) {
                callback(csv);
            });
        }
    });

})();
