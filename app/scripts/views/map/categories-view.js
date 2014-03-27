/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.CategoriesView = Backbone.View.extend({
        events: {
            'click .submenu__item' : 'clickHandler'
        },

        initialize: function (options) {
            this.options = options || {};

            this.categorieViewCollection = [];
            this.selectedCategories = {};

            var query = {
                source: JSON.stringify({
                    size: 50,
                    query: {
                        match_all: {}
                    }
                })
            };

            this.listenTo(this.collection, "reset", this.render);
            this.collection.fetch({ reset: true, data: query });
        },

        render: function () {
        	this.categorieViewCollection = _.map(this.collection.models, function (model) {
        		return new atlaas.Views.Map.CategorieView({ model: model });
        	});

        	this.$el.append(_.map(this.categorieViewCollection, function (categorie) {
        		return categorie.render().el;
        	}));
        },

        clickHandler: function (e) {
            e.preventDefault();

            var $item = $(e.target);

            this.selectedCategories['services.' + $item.data('type')] = $item.text();

            this.trigger('selected');
        }

    });



    atlaas.Views.Map.CategorieView = Backbone.View.extend({
        
        tagName: 'li',

        template: JST['app/scripts/templates/categorie-view.ejs'],

        initialize: function () {
            // console.log(this.model.toJSON());
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });

})();
