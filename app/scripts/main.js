/*global app, $*/


window.atlaas = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    CONFIG: {
        elasticsearch: 'http://elastic.makina-corpus.net/atlaas',
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
            appView.renderMap();
        });

        this.router.on('route:news', function () {
            appView.renderNews();
        });

        this.router.on('route:edit', function (action_id) {
            appView.renderActionForm(action_id);
        });

        this.router.on('route:new', function () {
            appView.renderActionForm();
        });

        this.router.on('route:reviewlist', function () {
            appView.renderReviewList();
        });

        this.router.on('route:login', function () {
            appView.renderLogin();
        });

        this.router.on('route:poi-detail', function (action_id) {
            // If mapView not rendered
            if (typeof appView.currentView === "undefined" || appView.currentView !== appView.mapView)
                appView.renderMap();

            // If subview already present, hide it
            if (typeof appView.mapView.currentView !== "undefined")
                appView.mapView.currentView.close();

            // Then show detail view
            appView.mapView.showPoiDetail(action_id);
        });

        this.router.on('route:actor-filter', function (actor_id) {
            var state = { actor: actor_id }

            // If mapView not rendered
            if (typeof appView.currentView === "undefined" || appView.currentView !== appView.mapView)
                appView.renderMap(state);

            // If subview already present, hide it
            if (typeof appView.mapView.currentView !== "undefined")
                appView.mapView.currentView.close();
        });

        this.router.on('route', function (route) {
            appView.sidebarView.updateNavigation(route);
        });

        Backbone.history.start();
    }
};

$(document).ready(function () {
    'use strict';
    atlaas.init();
});
