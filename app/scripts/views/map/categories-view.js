/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.CategoriesView = Backbone.View.extend({

        initialize: function () {
        	this.render();
        },

        render: function () {
        	this.categories = _.map(this.collection.models, function (model) {
        		return new atlaas.Views.CategorieView({ model: model });
        	});

        	this.$el.append(_.map(this.categories, function (categorie) {
        		return categorie.render().el;
        	}));
        },

    });

    atlaas.Views.CategorieView = Backbone.View.extend({
        
        tagName: 'li',

        template: JST['app/scripts/templates/categorie-view.ejs'],

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },
    });

})();
