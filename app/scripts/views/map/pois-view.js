/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoisView = Backbone.View.extend({

        initialize: function () {
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
            this.collection.each(this.addOne, this);

            return this;
        },

        addOne: function(_poi) {
            var poi = new atlaas.Views.Map.PoiView({ model: _poi });
        }

    });

})();
