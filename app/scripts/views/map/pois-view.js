/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // POIs view : this view displays POIs on the map and pois in the result list
    atlaas.Views.Map.PoisView = Backbone.View.extend({
        events: {
            'click .results-menu__item'     : 'clickResultHandler',
            'click .results-menu__bt'       : 'clickOpenResultHandler',
        },

        el: '.results-menu__wrapper',

        initialize: function () {
            this.poiViewCollection          = [];
            this.poiResultsViewCollection   = [];
            this.poiLayer                   = new L.POILayer();
            this.$activeResult              = $();
            this.syncResults                = true;

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
            var resultsCollection = this.syncResults ? this.collection : searchResultsCollection;

            // ResultsView
            this.poiResultsViewCollection = _.map(resultsCollection.models, function (_model, index) {
                return new atlaas.Views.Map.PoiResultView({ model: _model });
            });

            // never display more than the 30 first results in the list (user must zoom/search to acurate)
            this.poiResultsViewCollection = this.poiResultsViewCollection.slice(0, 30);

            this.$el.html(_.map(this.poiResultsViewCollection, function (_result) {
                return _result.render().el;
            }));


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

        clickResultHandler: function (e) {
            e.preventDefault();

            var $result = $(e.currentTarget);

            this.$activeResult.removeClass('active');
            this.$activeResult = $result;

            var poiId = $result.attr('href');

            var poiView = _.find(this.poiViewCollection, function(poiView){
                return poiView.model.id == poiId;
            });

            $result.addClass('active');

            this.trigger('panToPoi', poiView);
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
