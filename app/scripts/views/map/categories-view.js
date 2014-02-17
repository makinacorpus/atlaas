/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.CategoriesView = Backbone.View.extend({
        events: {
            'click > li > .submenu__item'           : 'clickEnjeuxHandler',
            'click .usages > li > .submenu__item'   : 'clickUsagesHandler',
            'click .services > li > .submenu__item' : 'clickServicesHandler',
            'click .submenu__item'                  : 'clickHandler'
        },

        initialize: function (options) {
            this.options = options || {};

            this.categorieViewCollection = [];
            this.selectedCategories = {}

            // console.log(this.model.toJSON());
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

        clickEnjeuxHandler: function (e) {
            e.preventDefault();

            this.selectedCategories = { enjeu_de_developpement: $(e.target).text() };
        },

        clickUsagesHandler: function (e) {
            e.preventDefault();

            this.selectedCategories = { usage: $(e.target).text() };
        },

        clickServicesHandler: function (e) {
            e.preventDefault();

            this.selectedCategories = { service: $(e.target).text() };
        },

        clickHandler: function (e) {
            e.preventDefault();

            var categoryName = $(e.target).text();

            // var selectedCategory = this.collection.find(function (_category) {
            //     return _category.get('enjeu') == categoryName;
            // });

            // selectedCategory.set('selected', !selectedCategory.get('selected'));
            this.trigger('selected');
        }

    });

    atlaas.Views.Map.CategorieView = Backbone.View.extend({
        
        tagName: 'li',

        template: JST['app/scripts/templates/categorie-view.ejs'],

        initialize: function () {
            this.listenTo(this.model, 'change:selected', this.selectedHandler);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        selectedHandler: function () {
            this.$el.toggleClass('active');
        }
    });

})();
