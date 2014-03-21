/*global app, $*/


window.atlaas = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';

        this.height = document.documentElement.clientHeight;
        this.width  = document.documentElement.clientWidth;

        $(window).on('resize', _.bind(function () {
            this.height = document.documentElement.clientHeight;
            this.width  = document.documentElement.clientWidth;
        }, this));

        var router = new this.Routers.AppRouter();
        var appView = new this.Views.AppView();

        router.on('route:home', function () {
            appView.renderMap();
        });

        router.on('route:news', function () {
            appView.renderNews();
        });

        router.on('route:poi-detail', function (action_id) {
            if (!appView.mapView) appView.renderMap();
            
            console.log('actionId: '+action_id);
        });

        router.on('route:category', function (category) {
            if (!appView.mapView) appView.renderMap();

            console.log('category: '+category);
        });

        router.on('route', function (route) {
            appView.sidebarView.updateNavigation(route);
            appView.hideSidebar();
        });

        Backbone.history.start();
    }
};

$(document).ready(function () {
    'use strict';
    atlaas.init();
});
