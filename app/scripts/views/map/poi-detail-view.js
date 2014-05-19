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
            'click .filter'                      : 'filtersBtHandler'
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

            atlaas.router.navigate('map');
            this.trigger('closed');
        	this.close();
        },

        editBtHandler: function (e) {
            e.preventDefault();

            atlaas.router.navigate('edit/' + this.model.id, {trigger: true});
        },

        filtersBtHandler: function (e) {
            e.preventDefault();

            var filter = {
                type: $(e.currentTarget).attr('data-type'),
                name: $(e.currentTarget).attr('data-name'),
                id: $(e.currentTarget).attr('data-id')
            }

            this.close();
            atlaas.router.navigate('map');
            this.trigger('closed');
            this.trigger('filtered', filter);
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
