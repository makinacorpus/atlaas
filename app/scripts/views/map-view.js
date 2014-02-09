/*global app, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.MapView = Backbone.View.extend({
        events: {
            'click .submenu__item'        : 'toggleMenu'
        },

        template: JST['app/scripts/templates/map-view.ejs'],

        attributes: { id: 'map-container', class: 'container' },

        render: function (mapId) {
            this.mapId = mapId;

            this.$el.html(this.template({ id:this.mapId }));

            // sample tests models for categories
            var catA = new atlaas.Models.CategoryModel({ url: '#services-publics', title: 'Efficacité des Services publics' });
            var catB = new atlaas.Models.CategoryModel({ url: '#cohesion-sociale', title: 'Renforcement de la Cohésion sociale' });

            var categories = new atlaas.Collections.CategoriesCollection([catA, catB]);

            var categoriesView = new atlaas.Views.CategoriesView({ el: this.$el.find('.results-menu__categories .submenu'), collection: categories });
            this.$el.append(categoriesView);

            return this;
        },

        initMap: function () {
            var map = L.map(this.mapId).setView([51.505, -0.09], 13);

            // add an OpenStreetMap tile layer
            L.tileLayer('http://{s}.tile.cloudmade.com/6f15a6651c8849349feea8b81a207bc1/997/256/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        },

        toggleMenu: function(e) {
            var $item = $(e.currentTarget);
            var $currentSubmenu = $item.parents('ul');
            var $newSubmenu = $item.siblings('ul');
            
            if ($newSubmenu.length == 0) return;

            e.preventDefault();

            var $menuAnim = $newSubmenu.clone().addClass('in').insertAfter($currentSubmenu);
            
            var tweenOut = TweenLite.to($currentSubmenu, 0.6,
                { 'x': '-220px',
                'opacity': '0',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $currentSubmenu.attr('style', '');
                } });

            var tweenIn = TweenLite.fromTo($menuAnim, 0.6,
                { 'x': '220px',
                'opacity': '0'},
                { 'x': '0px',
                'opacity': '1',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $currentSubmenu.addClass('subview');
                    $item.parent().addClass('subviewopen');
                    $menuAnim.remove();
                },
                onCompleteScope: this
                });
        }

    });

})();
