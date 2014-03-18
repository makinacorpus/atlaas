/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoiDetailView = Backbone.View.extend({

        template: JST['app/scripts/templates/poi-detail-view.ejs'],

        id: 'poi-detail',

        className: 'poi-detail', // for css purpose

        events: {
            'click .detail__bt--close'           : 'closeBtHandler',
            'click .detail__bt--edit'            : 'editBtHandler',
            'click .detail__meta .detail__bt'    : 'filtersBtHandler',
        },

        initialize: function () {

        },

        render: function () {
            console.log(this.model.toJSON());
        	this.$el.html(this.template(this.model.toJSON()));

        	return this;
        },

        closeBtHandler: function (e) {
        	e.preventDefault();

        	this.close();
        },

        editBtHandler: function (e) {
            e.preventDefault();

            atlaas.router.navigate("edit/" + this.model.id, {trigger: true});
        },

        filtersBtHandler: function (e) {
            e.preventDefault();
        },

        open: function () {
        	var tweenIn = TweenLite.fromTo(this.$el, 0.4,
        	    { 'y': atlaas.height*0.2,
        	    opacity: 0},
        	    { 'y': 0,
        	    opacity: 1,
        	    ease: Power3.easeInOut,
        	    onComplete: function () {
        	        tweenIn.kill();
        	    }
        	});
        },

        close: function () {
        	var tweenOut = TweenLite.to(this.$el, 0.4,
        	    { 'y': atlaas.height*0.2,
        	    opacity: 0,
        	    ease: Power3.easeInOut,
        	    onComplete: function () {
        	        tweenOut.kill();
        	        this.remove();
        	    },
        	    onCompleteScope: this 
        	});
        }

    });

})();
