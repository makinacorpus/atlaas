/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // News view : the news page.
    atlaas.Views.StaticPageView = Backbone.View.extend({
    	id: 'static',

        className: 'container',

        initialize: function () {

        },

        render: function () {
        	this.$el.html(this.template);

            return this;
        },

        loadPage: function () {
            var deferred = $.Deferred();
            var that = this;

            $.ajax({
                url: 'pages/' + Backbone.history.fragment + '.html',
            }).done(function(data) {
                that.template = data;
                deferred.resolve();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                that.template = $.ajax({
                    url: '404.html',
                }).done(function(data) {
                    that.template = data;
                    deferred.resolve();
                });
            });


            return deferred;
        }

    });

})();
