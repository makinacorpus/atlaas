/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.ActiveFilterView = Backbone.View.extend({
        
        tagName: 'button',

        className: 'activerFilterBt icon-cross',

        events: {
            'click'     : 'clickHandler'
        },

        template: _.template('<%= filter %>'),

        initialize: function (options) {
            this.options = options || {};
        },

        render: function () {
            this.$el.html(this.template(this.options));
            console.log(this.options);
            return this;
        },

        clickHandler: function (e) {
            this.trigger('activeFilterRemoved');
            this.remove();
        }
    });

})();
