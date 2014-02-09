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
    }
};

$(document).ready(function () {
    'use strict';
    atlaas.init();
});
