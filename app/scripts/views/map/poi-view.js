/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // POI view : representation of a POI displayed on the map
    atlaas.Views.Map.PoiView = Backbone.View.extend({

        customIcon: L.divIcon({className:'custom-icon', iconSize:null, popupAnchor: [-2, -40]}),

        initialize: function () {
            // console.log(this.model.toJSON());

            // this can have multiples markers/location for the same poi
            this.markers = [],

            _.each(this.model.get('lieux'), function (location, index) {
                this.markers[index] = new CustomMarker([location.latitude, location.longitude], {icon: this.customIcon, id: this.model.id});
            }, this);
        }
    });

    // POI result view : 'li' element of the results list
    atlaas.Views.Map.PoiResultView = atlaas.Views.Map.PoiView.extend({

        template: JST['app/scripts/templates/poi-result-view.ejs'],

        tagName: 'li',

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });

})();
