/*global atlaas, Backbone*/

atlaas.Collections = atlaas.Collections || {};

(function () {
    'use strict';

    atlaas.Collections.CategoriesCollection = Backbone.Collection.extend({

        model: atlaas.Models.CategoriesModel

    });

})();
