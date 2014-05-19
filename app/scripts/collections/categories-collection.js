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

                // if (typeof this.options.state.categories.axe !== 'undefined') {
                //     var axe = this.categoriesCollection.findWhere({ 'axe' : this.options.state.categories.axe });
                //     _.extend(urlFilters, { a: axe.id });
                // }

                // if (typeof this.options.state.categories.enjeu !== 'undefined') {
                //     var enjeuId;
                //     var that = this;
                //     this.categoriesCollection.each(function(axe) {
                //         _.each(axe.get('enjeux'), function(enjeu, key) {
                //             if (enjeu.enjeu === that.options.state.categories.enjeu) {
                //                 enjeuId = key;
                //                 return;
                //             }
                //         });
                //     });
                //     _.extend(urlFilters, { e: enjeuId });
                // }
                // if (typeof this.options.state.categories.usage !== 'undefined') {
                //     var usageId;
                //     var that = this;
                //     this.categoriesCollection.each(function(axe) {
                //         _.each(axe.get('enjeux'), function(enjeu) {
                //             _.each(enjeu.usages, function(usage, key) {
                //                 if (usage.usage === that.options.state.categories.usage) {
                //                     usageId = key;
                //                     return;
                //                 }
                //             });
                //         });
                //     });
                //     _.extend(urlFilters, { u: usageId });
                // }

                // if (typeof this.options.state.categories.service !== 'undefined') {
                //     var serviceId;
                //     var that = this;
                //     this.categoriesCollection.each(function(axe) {
                //         _.each(axe.get('enjeux'), function(enjeu) {
                //             _.each(enjeu.usages, function(usage) {
                //                 _.each(usage.services, function(_service) {
                //                     if (_service.service === that.options.state.categories.service) {
                //                         serviceId = _service.id_service;
                //                         return;
                //                     }
                //                 });
                //             });
                //         });
                //     });
