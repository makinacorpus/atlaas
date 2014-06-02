/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // News view : the news page.
    atlaas.Views.NewsView = Backbone.View.extend({
    	id: 'news',

        className: 'container',

        initialize: function () {
            this.newsNumber = 3;
            this.template = '';
        },

        render: function () {
        	this.$el.html(this.template);

            return this;
        },

        loadPage: function () {
            var deferred = $.Deferred();
            var that = this;

            for (var i = 1; i <= this.newsNumber; i++) {
                $.ajax({
                    url: 'pages/news/' + i + '.html',
                }).done(function(data) {
                    that.template += data;
                    deferred.resolve();
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    deferred.resolve();
                });
            }

            return deferred;
        }

    });

})();
