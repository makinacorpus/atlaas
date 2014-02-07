/*global app, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.MapView = Backbone.View.extend({
        events: {
            'click .submenu .submenu__item'        : 'toggleMenu'
        },

        template: JST['app/scripts/templates/map-view.ejs'],

        attributes: { id: 'map-container', class: 'container' },

        initialize: function () {
            this.$menuNavBt = $('.submenu > a');
        },

        render: function (mapId) {
            this.mapId = mapId;
            this.$el.html(this.template({ id:this.mapId }));

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
            e.preventDefault();

            var $item = $(e.currentTarget);
            var $currentSubmenu = $item.parents('.submenu');
            var $newSubmenu = $item.siblings('.submenu');

            $currentSubmenu.clone().css('opacity', 0).insertAfter($currentSubmenu);
            
            var tween = TweenLite.to($currentSubmenu, 0.6,
                { 'x': '-220px',
                'opacity': '0',
                ease: Power2.easeInOut });
        }

    });

})();
