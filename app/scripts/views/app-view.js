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

            this.sidebarView  = new atlaas.Views.SidebarView();
        },

        render: function () {
            this.$pageContainer.empty();

            if (this.sidebarView.isVisible()) this.hideSidebar();

            return this;
        },

        renderMap: function () {
            this.render();
            
            this.mapView = new atlaas.Views.Map.MapView({map: 'map'});

            // Prepare DOM before initializing mapView cause Leaflet needs an existing element on init.
            this.$pageContainer.append(this.mapView.render().el);

            // Once appended to DOM, init Leaflet map
            this.mapView.initMap();

            // this.mapView.initResultsMenu();

            return this;
        },

        renderNews: function () {
            this.render();

            var newsView = new atlaas.Views.NewsView();
            this.$pageContainer.append(newsView.template());

            newsView.render();

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
            var action = new atlaas.Models.PoiModel();
            action.id = action_id;
            action.fetch();
            this.listenTo(action, 'sync', function () {
                var actionForm = new atlaas.Views.ActionForm({model: action});
                this.$pageContainer.append(actionForm.render().$el);
            });
            return this;
        }

    });

})();
