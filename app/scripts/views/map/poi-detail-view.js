/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoiDetailView = Backbone.View.extend({

        template: JST['app/scripts/templates/poi-detail-view.ejs'],

        id: 'poi-detail',

        className: 'poi-detail', // for css purpose

        initialize: function () {

        },

        render: function () {
        	this.$el.html(this.template(this.model.toJSON()));

        	return this;
        }

    });

})();
