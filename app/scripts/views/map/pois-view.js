/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // POIs view : this view displays POIs on the map and pois in the result list
    atlaas.Views.Map.PoisView = Backbone.View.extend({
        events: {
            'click .results-menu__bt'       : 'clickOpenResultHandler',
        },

        el: '.results-menu__wrapper',

        initialize: function () {
            this.poiViewCollection          = [];
            this.poiResultsViewCollection   = [];
            this.poiLayer                   = new L.POILayer();
            this.markers                    = {};

            // Initialy, display a poi summary
            var query = {
                source: JSON.stringify({
                    "size" : 30,
                    "query" : {
                        "match_all" : {}
                    }
                })
            };
            
            this.collection.fetch({ data: query });
            this.listenTo(this.collection, "reset", this.render);
        },

        render: function () {
            this.markers = {};

            this.poiViewCollection = _.map(this.collection.models, function (_model) {
                return new atlaas.Views.Map.PoiView({ model: _model });
            });

            this.poiResultsViewCollection = _.map(this.collection.models, function (_model, index) {
                return new atlaas.Views.Map.PoiResultView({ model: _model });
            });

            this.poiResultsViewCollection = this.poiResultsViewCollection.slice(0, 30);

            this.$el.html(_.map(this.poiResultsViewCollection, function (_result) {
                return _result.render().el;
            }));

            // add markers on map for each poiView
            _.each(this.poiViewCollection, function (poiView) {
                _.each(poiView.markers, function (marker) {
                    this.markers[marker.options.id] = marker;
                }, this);
            }, this);

            this.poiLayer.updatePois(this.markers);

            return this;
        },

        clickOpenResultHandler: function (e) {
            e.preventDefault();

            var poiId = $(e.target).attr('href');

            var poiResultView = _.find(this.poiResultsViewCollection, function(poiResultView){
                return poiResultView.model.id == poiId;
            });

            this.trigger('openResult', poiResultView);
        }

    });

})();
