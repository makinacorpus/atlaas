/*global app, $*/


window.atlaas = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';

        var router = new atlaas.Routers.AppRouter();
        var appView = new this.Views.AppView();

        router.on('route:home', function () {
            appView.showMap();
        });


        Backbone.history.start();
    }
};

$(document).ready(function () {
    'use strict';
    atlaas.init();
});
