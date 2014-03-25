/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // News view : the news page.
    atlaas.Views.NewsView = Backbone.View.extend({
    	id: 'news',

        className: 'container',

        template: JST['app/scripts/templates/news-view.ejs'],

        initialize: function () {

        },

        render: function () {
        	this.$el.html(this.template());

            return this;
        }

    });

})();
