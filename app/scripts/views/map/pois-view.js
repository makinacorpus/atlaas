/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoisView = Backbone.View.extend({

        collectionView: [],

        initialize: function () {
            // Initialy, display a poi summary
            var query = {
                source: JSON.stringify({
                    size: 5,
                    query: {
                        match_all: {}
                    }
                })
            };

            this.listenTo(this.collection, "reset", this.render);
            this.collection.fetch({ reset: true, data: query });
        },

        render: function() {
            this.collection.each(function (poi) {
                // pois can have multiples location, so create one marker per poi location
                _.each(poi.get('lieux'), function (lieu, index) {
                    // poi.set({lat: lieu.latitude, lng: lieu.longitude});
                    this.addOne(poi, index);
                }, this);
            }, this);

            return this;
        },

        addOne: function(_model, _locationIndex) {
            var poi = new atlaas.Views.Map.PoiView({ model: _model, locationIndex: _locationIndex });
            this.collectionView.push(poi);
        }

    });

})();
