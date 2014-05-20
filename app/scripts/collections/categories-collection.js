/*global atlaas, Backbone*/

atlaas.Collections = atlaas.Collections || {};

(function () {
    'use strict';

    atlaas.Collections.CategoriesCollection = Backbone.Collection.extend({

        model: atlaas.Models.CategoryModel,

        url: atlaas.CONFIG.elasticsearch + '/axes/_search',

        parse: function(response, options)  {
            return response.hits.hits;
        },

        getCategoryIdOfType: function(type, categoryName) {
            var id;

            if (type === 'enjeu') {
                this.each(function(category) {
                    var _enjeu = category.getEnjeu(categoryName);
                    if (typeof _enjeu !== 'undefined') {
                       id = _enjeu.id_enjeu;
                    }
                });
            } else if (type === 'usage') {
                this.each(function(category) {
                    _.each(category.get('enjeux'), function(enjeu) {
                        _.each(enjeu.usages, function(usage, key) {
                            if (usage.usage === categoryName) {
                                id = key;
                                return;
                            }
                        });
                    });
                });
            } else if (type === 'service') {
                this.each(function(category) {
                    _.each(category.get('enjeux'), function(enjeu) {
                        _.each(enjeu.usages, function(usage) {
                            _.each(usage.services, function(_service, key) {
                                if (_service.service === categoryName) {
                                    id = _service.id_service;
                                    return;
                                }
                            });
                        });
                    });
                });
            }

            return id;
        }

    });

})();