/*global app, Backbone*/

atlaas.Collections = atlaas.Collections || {};

(function () {
    'use strict';

    atlaas.Collections.PagesCollection = Backbone.Collection.extend({

        model: atlaas.Models.PageModel

    });

})();
