/*global app, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.AppView = Backbone.View.extend({

        el: 'body',

        events: {
            'click #toggle-sidebar'     : 'toggleSidebar'
        },

        initialize: function () {
            this.$mainContainer = $('#main-container');
            this.$pageContainer = $('#pages-container');
            this.$toggleSidebarBt = $('#toggle-sidebar');

            this.currentView = undefined;

            this.sidebarView  = new atlaas.Views.SidebarView();
        },

        render: function () {
            this.$pageContainer.empty();
            if(typeof this.currentView !== "undefined") this.currentView.remove();

            if (this.sidebarView.isVisible()) this.hideSidebar();

            return this;
        },

        renderMap: function (state) {
            this.render();

            this.mapView = new atlaas.Views.Map.MapView({map: 'map', state: state});

            this.currentView = this.mapView;

            // Prepare DOM before initializing mapView cause Leaflet needs an existing element on init.
            this.$pageContainer.append(this.mapView.render().el);

            // Once appended to DOM, init Leaflet map
            this.mapView.initMap();

            return this;
        },

        renderNews: function () {
            this.render();

            var newsView = new atlaas.Views.NewsView();

            this.currentView = newsView;

            newsView.loadPage().then(_.bind(function() {
                console.log('lol');
                this.$pageContainer.append(newsView.render().el);
            }, this));

            return this;
        },

        toggleSidebar: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if(this.sidebarView.isVisible()) this.hideSidebar(); else this.showSidebar();
        },

        showSidebar: function () {
            var tween = TweenLite.to(this.$mainContainer, 0.6,
                {'x': '-220px',
                ease: Power2.easeInOut});

            $(this.sidebarView.el).attr('data-visible', 'visible');
            this.$mainContainer.attr('data-visible', 'hidden');
            
            this.$mainContainer.one('click.sidebar', _.bind(function (e) {
                e.stopPropagation();
                e.preventDefault();

                this.hideSidebar();
            }, this));
        },

        hideSidebar: function () {
            var tween = TweenLite.to(this.$mainContainer, 0.6,
                {'x': '0',
                ease: Power2.easeInOut});

            $(this.sidebarView.el).attr('data-visible', 'hidden');
            this.$mainContainer.attr('data-visible', 'visible');

            this.$mainContainer.off('click.sidebar');
        },

        renderActionForm: function(action_id) {
            this.render();

            var action = new atlaas.Models.PoiDetailModel({ id: action_id });
            
            if (typeof action_id !== "undefined") { // Edit action
                action.id = action_id;
                action.set('id_action', action.id);
                action.fetch();
                
                this.listenTo(action, 'sync', function () {
                    var actionFormView = new atlaas.Views.ActionForm({ model: action });
                    this.currentView = actionFormView;
                    this.$pageContainer.append(actionFormView.render().$el);
                });
            } else { // New action
                var actionFormView = new atlaas.Views.ActionForm({ model: action });
                this.currentView = actionFormView;
                this.$pageContainer.append(actionFormView.render().$el);
            }
            
            return this;
        },

        renderLogin: function() {
            this.render();
            var login = new atlaas.Views.LoginForm();
            this.currentView = login;
            this.$pageContainer.append(login.render().$el);
            return this;
        },

        renderReviewList: function() {
            this.render();
            var collection = new atlaas.Collections.ReviewCollection();
            collection.fetch();
            this.listenTo(collection, 'sync', function () {
                var reviewListView = new atlaas.Views.ReviewListView(
                    {collection: collection}
                );
                this.currentView = reviewListView;
                this.$pageContainer.append(reviewListView.render().$el);
            });
        },

        renderStaticPage: function () {
            this.render();

            var staticPageView = new atlaas.Views.StaticPageView();

            this.currentView = staticPageView;

            staticPageView.loadPage().then(_.bind(function() {
                this.$pageContainer.append(staticPageView.render().el);
            }, this));


            return this;
        }

    });

})();
