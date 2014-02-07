/*global app, $*/


window.atlaas = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';

        var router = new this.Routers.AppRouter();
        var appView = new this.Views.AppView();

        router.on('route:home', function () {
            appView.renderMap();
        });

        router.on('route:news', function () {
            appView.renderNews();
        });

        Backbone.history.start();

        // sample tests models for categories
        var catA = new this.Models.CategoryModel({ title: 'Efficacité des Services publics' });
        var catB = new this.Models.CategoryModel({ title: 'Renforcement de la Cohésion sociale' });

        var categories = new atlaas.Collections.CategoriesCollection([catA, catB]);

        console.log('Collection size: '+ categories.length);
        console.log(categories.get(catA.cid).toJSON());
    }
};

$(document).ready(function () {
    'use strict';
    atlaas.init();
});
