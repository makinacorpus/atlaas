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
            'submit form'                   : 'submitHandler',
            'click .results-menu__search__clear-bt' : 'clearHandler',
        },

        initialize: function (options) {
            this.options = options || {};

            this.$el.find('.search-input').val(this.options.state);

            if (this.options.state !== '') { 
                this.$el.find('.search-input').focus();
                this.search(this.options.state);
            }
        },

        searchHandler: function (e) {
            console.log(e);
            if ($(e.target).val() == this.options.state) return;
            this.options.state = $(e.target).val();

            this.search(this.options.state);
        },

        search: function (query) {
            if (this.options.state !== '') {
                this.$el.addClass('search');
            } else {
                this.reset();
            }

            this.trigger('search', query);
        },

        clearHandler: function (e) {
            this.$el.find('.search-input').val('').trigger('change');
        },

        reset: function () {
            this.$el.removeClass('search');
        },

        submitHandler: function (e) {
            e.preventDefault();
        }
    });

})();

