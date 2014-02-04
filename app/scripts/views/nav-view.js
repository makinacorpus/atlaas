/*global app, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.NavView = Backbone.View.extend({
        el: 'nav',

        template: JST['app/scripts/templates/nav-template.ejs'],

        initialize: function () {
            $('.btn-menu').on('click', function(e) {
                e.preventDefault();
            });

        	this.render();
        },

        render: function () {
        	this.$el.html(this.template({pages: this.collection.models}));

        	return this;
        },

    });

})();
