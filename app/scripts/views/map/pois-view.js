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
            this.poiLayer                   = new L.POILayer(),
            this.markers                    = {};

            // Initialy, display a poi summary
            var query = {
                source: JSON.stringify({
                    "size" : 250,
                    "query" : {
                        "match_all" : {}
                    }
                })
            };
            
            this.collection.fetch({ reset: true, data: query });
            this.listenTo(this.collection, "reset", this.render);
        },

        render: function () {
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

            return this;
        },

        clickOpenResultHandler: function (e) {
            e.preventDefault();

            var poiId = $(e.target).attr('href');

            var poiResultView = _.find(this.poiResultsViewCollection, function(poiResultView){
                return poiResultView.model.id == poiId;
            });

            this.trigger('openResult', poiResultView);
        },

        fitToBounds: function (mapState) {
            console.log('fit to bounds!');
            console.log(mapState.bounds);

            var query = {
                source: JSON.stringify({
                    "query": {
                        "filtered": {
                            "query": {
                                "match_all": {}
                            }
                        }
                    },
                    "filter": {
                        "geo_bounding_box": {
                            "lieux[0]": {
                                "top_left": {
                                    "lat": 47.55,
                                    "lon": -122.06
                                },
                                "bottom_right": {
                                    "lat": 47.52,
                                    "lon": -122.02
                                }
                            }
                        }
                    }
                })
            };

            this.collection.fetch({ reset: true, data: query });
        }

    });

})();
