/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoiView = Backbone.View.extend({

        template: JST['app/scripts/templates/poi-detail-view.ejs'],

        initialize: function () {
            console.log(this.model.toJSON());

            // this can have multiples markers/location for the same poi
            this.markers = [],

            _.each(this.model.get('lieux'), function (lieu, index) {
                this.markers[index] = L.marker([lieu.latitude, lieu.longitude]);
            }, this);

            // Create the marker popup
            // var popup = document.createElement('a');
            // popup.href = App.Config.mapUrl + this.model.get('slug') + '/';
            // popup.innerHTML = this.model.get('name');

            // this.marker.bindPopup(popup);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });

    atlaas.Views.Map.PoiResultView = atlaas.Views.Map.PoiView.extend({

        template: JST['app/scripts/templates/poi-result-view.ejs'],

        tagName: 'li',

        initialize: function () {
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });

})();
