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

            this.$el.find('.search-input').val(this.options.state);

            if (this.options.state !== '') { this.$el.find('.search-input').focus(); }
        },

        searchHandler: function (e) {
            if ($(e.target).val() == this.options.state) return;
            this.options.state = $(e.target).val();

            this.search(this.options.state);
        },

        search: function (query) {
            this.trigger('search', query);
        }
    });

})();

