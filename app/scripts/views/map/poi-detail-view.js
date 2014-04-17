/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    // POI detail view : '#poi-detail' element
    atlaas.Views.Map.PoiDetailView = Backbone.View.extend({

        template: JST['app/scripts/templates/poi-detail-view.ejs'],

        id: 'poi-detail',

        className: 'poi-detail', // for css purpose

        events: {
            'click .detail__bt--close'           : 'closeBtHandler',
            'click .detail__bt--edit'            : 'editBtHandler',
            'click .detail__bt--location'        : 'filtersBtHandler',
            'click .detail__breadcrumb'          : 'categoryBtHandler',
        },

        initialize: function () {
            var that = this;
            this.csv = "";

            this.model.fetch();

            this.listenTo(this.model, 'sync', function() {
                this.model.toCSV(function(data) {
                    that.csv = data;
                });

                var serviceId = this.model.get('services')[0].id_service;

                console.log(serviceId);

                var query = {
                    "size" : 2000,
                    "query": {
                        "filtered": {
                            "term" : { "services.id_service" : serviceId }
                        }
                    },
                    "partial_fields" : {
                        "partial" : {
                            "include" : ["id_action", "titre", "lieux.nom", "lieux.lat", "lieux.lon"]
                        }
                    },
                    "facets" : {
                        "lat" : {
                            "statistical" : {
                                "field" : "lieux.lat"
                            }
                        },
                        "lon" : {
                            "statistical" : {
                                "field" : "lieux.lon"
                            }
                        }
                    }
                };

                query = {
                    source: JSON.stringify(query.source)
                }

                $.when($.getJSON(atlaas.CONFIG.elasticsearch + '/actions/_search?source=' + encodeURIComponent(JSON.stringify(query))))
                .done(L.Util.bind(function (pois) {
                    console.log(pois);
                }, this));
            });
        },

        render: function () {
            console.log(this.model.toJSON());
        	this.$el.html(this.template(this.model.toJSON(), this.csv));

        	return this;
        },

        closeBtHandler: function (e) {
        	e.preventDefault();

            atlaas.router.navigate("map");
        	this.close();
        },

        editBtHandler: function (e) {
            e.preventDefault();

            atlaas.router.navigate("edit/" + this.model.id, {trigger: true});
        },

        filtersBtHandler: function (e) {
            e.preventDefault();

            var actorId = $(e.currentTarget).attr('href');

            this.close();
            atlaas.router.navigate(actorId, { trigger: true });
        },

        categoryBtHandler: function (e) {
            e.preventDefault();

            var $item = $(e.currentTarget);

            var selectedCategories = {};
            selectedCategories[$item.data('type')] = $item.attr('href');

            atlaas.router.navigate("map");
            this.close();
            this.trigger('filtered', selectedCategories);
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

                    // Reload Facebook button
                    try{ FB.XFBML.parse(); }catch(ex){}

                    // Reload Twitter button
                    try{ twttr.widgets.load(); }catch(ex){}
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
