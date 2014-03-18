/*global app, $*/


window.atlaas = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    CONFIG: {
        elasticsearch: 'http://localhost:9200/atlaas'
    },
    init: function () {
        'use strict';

        this.height = document.documentElement.clientHeight;
        this.width  = document.documentElement.clientWidth;

        $(window).on('resize', _.bind(function () {
            this.height = document.documentElement.clientHeight;
            this.width  = document.documentElement.clientWidth;
        }, this));

        this.router = new this.Routers.AppRouter();
        var appView = new this.Views.AppView();

        this.router.on('route:home', function () {
            appView.renderMap();
        });

        this.router.on('route:news', function () {
            appView.renderNews();
        });

        this.router.on('route:edit', function (action_id) {
            appView.renderActionForm(action_id);
        });

        this.router.on('route:category', function (category) {
            if (!appView.mapView) appView.renderMap();     

            console.log('category: '+category);
        });

        this.router.on('route', function (route) {
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
