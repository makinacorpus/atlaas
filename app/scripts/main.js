/*global app, $*/


window.atlaas = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    CONFIG: {
        elasticsearch: 'http://elastic-local.makina-corpus.net/atlaas',
        secure_elasticsearch: 'http://secured-elastic-local.makina-corpus.net/atlaas'
    },
    init: function () {
        'use strict';

        this.height = document.documentElement.clientHeight;
        this.width  = document.documentElement.clientWidth;
        this.currentView = undefined;

        $(window).on('resize', _.bind(function () {
            this.height = document.documentElement.clientHeight;
            this.width  = document.documentElement.clientWidth;
        }, this));

        this.router = new this.Routers.AppRouter();
        var appView = new this.Views.AppView();

        this.router.on('route:home', function () {
            if (!appView.mapView) appView.renderMap();
        });

        this.router.on('route:news', function () {
            appView.renderNews();
        });

        this.router.on('route:edit', function (action_id) {
            appView.renderActionForm(action_id);
        });

        this.router.on('route:reviewlist', function () {
            appView.renderReviewList();
        });

        this.router.on('route:login', function () {
            appView.renderLogin();
        });

        this.router.on('route:poi-detail', function (action_id) {
            if (!appView.mapView) appView.renderMap();

            appView.mapView.showPoiDetail(action_id);
        });

        this.router.on('route', function (route) {
            if (atlaas.currentView) {
                atlaas.currentView.close();
                atlaas.currentView = undefined;
            };

            appView.sidebarView.updateNavigation(route);
        });

        Backbone.history.start();
    }
};

$(document).ready(function () {
    'use strict';
    atlaas.init();
});
