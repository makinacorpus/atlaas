/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.SearchView = Backbone.View.extend({
        events: {
            'change .search-input'          : 'searchHandler',
            'keyup .search-input'           : 'searchHandler',
            'paste .search-input'           : 'searchHandler',
            'mouseup .search-input'         : 'searchHandler',
        },

        initialize: function (options) {
            this.options = options || {};

            this.lastValue = '';
        },

        searchHandler: function (e) {
            if ($(e.target).val() == this.lastValue) return;
            this.lastValue = $(e.target).val();

            console.log(this.options.mapState);
        },
    });

})();

