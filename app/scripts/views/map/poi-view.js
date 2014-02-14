/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoiView = Backbone.View.extend({

        template: JST['app/scripts/templates/poi-detail-view.ejs'],

        customIcon: L.divIcon({className:'custom-icon', iconSize:null}),

        initialize: function () {
            console.log(this.model.toJSON());

            // this can have multiples markers/location for the same poi
            this.markers = [],

            _.each(this.model.get('lieux'), function (location, index) {
                this.markers[index] = new CustomMarker([location.latitude, location.longitude], {icon: this.customIcon, id: this.model.id});
            }, this);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        // setPopup: function (content) { 
        //     // Create the marker popup
        //     var popup = document.createElement('a');
        //     popup.href = App.Config.mapUrl + this.model.get('slug') + '/';
        //     popup.innerHTML = this.model.get('name');

        //     this.marker.bindPopup(popup);
        // }
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
