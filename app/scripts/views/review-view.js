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

    var parseValue = function(value){
            var html = "";
            if(typeof(value) == "object"){
                    for (var i = 0; i < value.length; i++) {
                        html += "<ul>";
                        var item = value[i];
                        for (var j = 0; j < Object.keys(item).length; j++) {
                            html += ("<li>" + Object.keys(item)[j] + ":" + parseValue(item[Object.keys(item)[j]]) + "</li>");                        }
                        html += "</ul>";
                    }
                }
                else{
                    html += value;
                }
            return html;
    }

    atlaas.Views.ReviewItemView = Backbone.View.extend({

        tagName: 'li',

        template: JST['app/scripts/templates/reviewitem-view.ejs'],

        events: {
            'click .review__link': 'toggleDetail',
            'click .review__btn--valid': 'validate',
            'click .review__btn--reject': 'reject',
        },
   
        table: function() {
            var html = "<table class='table'>"
            for(var attr in this.model.attributes) {
                html += "<tr><td>" + attr +"</td><td>";
                var value = this.model.get(attr);
                html += parseValue(value);
                html += "</td></tr>";
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

        doAjaxSync: function(type, key_id, elements) {
            if (elements.length > 0) {
                var element = elements.shift(); 
                $.ajax({
                    // /type/id/_update allows partial update
                    url: atlaas.CONFIG.secure_elasticsearch + '/' + type + '/' + element[key_id] + '/_update',
                    data: JSON.stringify({doc: element}),
                    type: "POST",
                    dataType: "json",
                    headers: {
                     'Authorization': "Basic " + btoa(atlaas.CONFIG.login + ":" + atlaas.CONFIG.password)
                    }
                    }).done(function(){
                        if (element.length > 0) {
                            this.doAjaxSync(type, key_id, elements);
                        }
                    })
            }
        },

        validate: function(e) {
            var model = this.model;
            model.set('id_action', model.id)
            model.credentials = {
                username: atlaas.CONFIG.login,
                password: atlaas.CONFIG.password
            };
            // We update lieux / personnes index
            this.doAjaxSync("lieux", "id_lieu", model.attributes.lieux)
            this.doAjaxSync("personnes", "id_personne", model.attributes.personnes);

            // we use low-level Backbone.sync method to avoid messing up
            // permanently with id and id_action
            Backbone.sync('update', model, {
                url: atlaas.CONFIG.secure_elasticsearch + '/actions/' + model.id,
                success: function () {

                    model.destroy({
                        url: atlaas.CONFIG.elasticsearch + '/review/' + model.id
                    });
                },
            })
        },

        reject: function(e) {
            this.model.destroy({
                url: atlaas.CONFIG.elasticsearch + '/review/' + this.model.id
            });
        }
    });

})();