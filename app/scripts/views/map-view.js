/*global app, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.MapView = Backbone.View.extend({
        template: JST['app/scripts/templates/map-view.ejs'],

        initialize: function () {
        },

        initMap: function () {
            var map = L.map(this.id).setView([51.505, -0.09], 13);

            // add an OpenStreetMap tile layer
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }

    });

})();
