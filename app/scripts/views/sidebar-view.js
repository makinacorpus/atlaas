/*global app, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.SidebarView = Backbone.View.extend({
    	el: '#aside-main',

    	initialize: function () {

    	},

    	isVisible: function () {
    		return $(this.el).attr('data-visible') == 'visible' ? true : false;
    	}

    });

})();
