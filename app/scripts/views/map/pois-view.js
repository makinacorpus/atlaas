/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // POIs view : this view displays POIs on the map and pois in the result list
    atlaas.Views.Map.PoisView = Backbone.View.extend({
        events: {
        },

        initialize: function () {
            this.poiViewCollection          = [];
            this.poiResultsViewCollection   = [];
            this.poiLayer                   = new L.POILayer();            
            this.syncResults                = true;
            this.searchResultsCollection    = undefined;

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
            // PoisView
            this.poiViewCollection = _.map(this.collection.models, function (_model) {
                return new atlaas.Views.Map.PoiView({ model: _model });
            });
            
            // Empty markers
            var markers = {};

            // add markers on map for each poiView
            _.each(this.poiViewCollection, function (poiView) {
                _.each(poiView.markers, function (marker) {
                    markers[marker.options.id] = marker;
                }, this);
            }, this);

            // Display markers
            this.poiLayer.updatePois(markers);

            return this;
        },

    });

})();
