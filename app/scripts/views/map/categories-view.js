/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.CategoriesView = Backbone.View.extend({

        initialize: function () {
            this.categorieViewCollection = [];
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

    });

    atlaas.Views.Map.CategorieView = Backbone.View.extend({
        
        tagName: 'li',

        template: JST['app/scripts/templates/categorie-view.ejs'],

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },
    });

})();
