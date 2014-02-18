/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoisView = Backbone.View.extend({
        events: {
            'click .results-menu__bt'       : 'clickOpenResultHandler',
        },

        el: '.results-menu__wrapper',

        initialize: function () {
            this.poiViewCollection          = [],
            this.poiResultsViewCollection   = [];
            this.poiLayer                   = new L.POILayer();

            // Initialy, display a poi summary
            var query = {
                source: JSON.stringify({
                    size: 50,
                    query: {
                        match_all: {}
                    }
                })
            };

            this.listenTo(this.collection, "reset", this.render);
            this.collection.fetch({ reset: true, data: query });
        },

        render: function () {
            this.poiViewCollection = _.map(this.collection.models, function (_model) {
                return new atlaas.Views.Map.PoiView({ model: _model });
            });

            this.poiResultsViewCollection = _.map(this.collection.models, function (_model) {
                return new atlaas.Views.Map.PoiResultView({ model: _model });
            });

            this.$el.html(_.map(this.poiResultsViewCollection, function (_result) {
                return _result.render().el;
            }));

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
