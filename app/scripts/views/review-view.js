/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.ReviewListView = Backbone.View.extend({

        tagName: 'ul',

        render: function () {
            var self = this;
            this.$el.html("");
            self.collection.each(function(review_item){
                var reviewItemView = new atlaas.Views.ReviewItemView({ model: review_item });
                review_item.on('destroy', function() {
                    self.collection.remove(review_item);
                    self.render();
                }, self);
                this.$el.append(reviewItemView.render().el);
            }, this);

            return this;
        }
        
    });

    atlaas.Views.ReviewItemView = Backbone.View.extend({
        
        tagName: 'li',

        template: JST['app/scripts/templates/reviewitem-view.ejs'],

        events: {
            'click .review__link': 'toggleDetail',
            'click .review__btn--valid': 'validate',
            'click .review__btn--reject': 'reject',
        },

        table: function() {
            var html = "<table>"
            for(var attr in this.model.attributes) {
                html += "<tr><td>" + attr +"</td>";
                html += "<td>" + this.model.get(attr) + "</td></tr>";
            }
            html += "</table>";
            return html;
        },

        render: function() {
            var data = {
                id: this.model.id,
                titre: this.model.get('titre'),
                details: this.table()
            }
            this.$el.html(this.template(data));
            this.$el.find(".review__detail").hide();
            return this;
        },

        toggleDetail: function(e) {
            e.preventDefault();
            $(e.delegateTarget).find('.review__detail').toggle();
        },

        validate: function(e) {
            var model = this.model;
            model.set('id_action', model.id)
            model.credentials = {
                username: atlaas.CONFIG.login,
                password: atlaas.CONFIG.password
            };
            // we use low-level Backbone.sync method to avoid messing up
            // permanently with id and id_action
            Backbone.sync('update', model, {
                url: atlaas.CONFIG.secure_elasticsearch + '/actions/' + model.id,
                success: function () {
                    model.destroy({
                        url: atlaas.CONFIG.elasticsearch + '/review/' + model.id
                    });
                }
            });
        },

        reject: function(e) {
            this.model.destroy({
                url: atlaas.CONFIG.elasticsearch + '/review/' + this.model.id
            });
        }
    });

})();