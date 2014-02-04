/*global app, $*/


window.atlaas = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';

        var home = new this.Models.PageModel({ name: 'Accueil' });
        var news = new this.Models.PageModel({ name: 'Actualité' });

        var pages = [home, news];
        
        new this.Views.NavView({
            collection: new this.Collections.PagesCollection(pages)
        });

        var map = L.map('map').setView([51.505, -0.09], 13);

        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
};

$(document).ready(function () {
    'use strict';
    atlaas.init();
});
