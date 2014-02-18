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
    	},

    	updateNavigation: function (route) {
    		$('.main-nav__item').removeClass('active');
    		$('.main-nav__item.'+route).addClass('active');
    	}

    });

})();
