/*global app, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.MapView = Backbone.View.extend({
        events: {
            'click .submenu__item'        : 'toggleMenu',
            'click .submenu__item--back'  : 'backMenu'
        },

        template: JST['app/scripts/templates/map-view.ejs'],

        attributes: { id: 'map-container', class: 'container' },

        initialize: function () {
        },

        render: function () {
            this.$el.html(this.template({ id:this.options.map }));

            return this;
        },

        renderPois: function () {
            this.pois = new atlaas.Collections.PoisCollection();

            this.poisView = new atlaas.Views.Map.PoisView({ collection: this.pois });
        },

        // called only when template is rendered cause Leaflet needs a DOM element
        initMap: function () {
            this.map = L.map(this.options.map).setView([46.883, 2.872], 6);

            // add an OpenStreetMap tile layer
            L.tileLayer('http://{s}.tile.cloudmade.com/6f15a6651c8849349feea8b81a207bc1/997/256/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            this.renderPois();
        },

        initResultsMenu: function () {
            // sample tests models for categories
            var cat1 = new atlaas.Models.CategoryModel({ url: '#enjeu/services-publics', title: 'Efficacité des Services publics' });
            var cat2 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Vitalité de la démocratie locale' });
            var cat3 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Protection de la vie privée' });
            var cat4 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Renforcement de la cohésion sociale' });
            var cat5 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Développement des solidarités' });
            var cat6 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Qualité de la vie quotidienne' });
            var cat7 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Diffusion et partage des ressources éducatives' });
            var cat8 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Développement des pratiques culturelles' });
            var cat9 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Protection et valorisation du patrimoine' });
            var cat10 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Création d’emplois et employabilité'});
            var cat11 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Développement économique et durable'});
            var cat12 = new atlaas.Models.CategoryModel({ url: '#enjeu/cohesion-sociale', title: 'Attractivité du territoire'});

            var categories = new atlaas.Collections.CategoriesCollection([cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, cat10, cat11, cat12]);

            var categoriesView = new atlaas.Views.Map.CategoriesView({ el: this.$el.find('.results-menu__categories .submenu'), collection: categories });
            this.$el.append(categoriesView);

            this.$categoriesContainer = this.$el.find('.results-menu__categories');
            this.$menuWrapper = this.$categoriesContainer.find('.menu-wrapper');
        },

        toggleMenu: function (e) {
            var $item = $(e.currentTarget),
            $currentSubmenu = $item.parents('ul'),
            $newSubmenu = $item.siblings('ul');
            
            if ($newSubmenu.length == 0) return;

            e.preventDefault();

            if (TweenLite.getTweensOf(this.$menuWrapper).length != 0) return;

            var $menuIn = $newSubmenu.clone().addClass('in').appendTo(this.$categoriesContainer);
            
            var tweenOut = TweenLite.to(this.$menuWrapper, 0.4,
                { 'x': '-220px',
                'z': '10px',
                'opacity': '0',
                ease: Power2.easeInOut,
                onComplete: function () {
                    tweenOut.seek(0);
                    tweenOut.pause();
                    tweenOut.kill();
                } });

            TweenLite.fromTo($menuIn, 0.4,
                { 'x': '220px',
                'opacity': '0'},
                { 'x': '0px',
                'opacity': '1',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $currentSubmenu.addClass('subview');
                    $item.parent().addClass('subviewopen');
                    $menuIn.remove();
                }
                });
        },

        backMenu: function (e) {
            var $item = $(e.currentTarget),
            $currentSubmenu = $item.closest('ul'),
            $parentMenu = $currentSubmenu.parent().closest('ul');

            e.preventDefault();

            if (TweenLite.getTweensOf(this.$menuWrapper).length != 0) return;

            var $menuIn = $parentMenu.clone().addClass('in').removeClass('subview').addClass('subviewopen').appendTo(this.$categoriesContainer);
            
            var tweenOut = TweenLite.to(this.$menuWrapper, 0.4,
                { 'x': '220px',
                'opacity': '0',
                ease: Power2.easeInOut,
                onComplete: function () {
                    tweenOut.seek(0);
                    tweenOut.pause();
                    tweenOut.kill();
                } });

            TweenLite.fromTo($menuIn, 0.4,
                { 'x': '-220px',
                'opacity': '0'},
                { 'x': '0px',
                'opacity': '1',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $parentMenu.removeClass('subview');
                    $('.subviewopen').removeClass('subviewopen');
                    $menuIn.remove();
                }
                });
        },

        showMarkers: function () {
            console.log('showMarkers');
        },

    });

})();
