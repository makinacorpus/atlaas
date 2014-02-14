/*global atlaas, Backbone*/

atlaas.Collections = atlaas.Collections || {};

(function () {
    'use strict';

    atlaas.Collections.CategoriesCollection = Backbone.Collection.extend({

        model: atlaas.Models.CategoryModel,

        url: 'http://elastic.makina-corpus.net/atlaas/services/_search',

        parse: function(response, options)  {
            return response.hits.hits;
        }

    });

})();
