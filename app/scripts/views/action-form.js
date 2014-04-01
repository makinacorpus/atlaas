/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.ActionForm = Backbone.View.extend({
        id: 'action-form',

        className: 'action-form container',

        templateEdit: JST['app/scripts/templates/action-edit-form.ejs'],
        
        templateNew: JST['app/scripts/templates/action-new-form.ejs'],

        events: {
            'click .action-form__bt--save': 'submitForReview'
        },

        initialize: function () {
            //Use BootstrapModal for object List editor
            Backbone.Form.editors.List.Modal.ModalAdapter = Backbone.BootstrapModal;

            var categoriesCollection = new atlaas.Collections.CategoriesCollection();
            categoriesCollection.fetch();

            var categoriesSchema = {
                services: { type: 'List', itemType: 'Object', subSchema: {
                    axe: {
                        type: 'Select',
                        options: function(callback, editor) {
                            callback(categoriesCollection.map(function(model) {
                                return model.get('axe');
                            }));
                        }
                    },
                    enjeu_de_developpement: {
                        type: 'Select',
                        options: function(callback, editor) {
                            callback(categoriesCollection.map(function(model) {
                                return model.get('enjeu_de_developpement');
                            }));
                        }
                    },
                    usage: {
                        type: 'Select',
                        options: function(callback, editor) {
                            console.log(categoriesCollection.at(0).get('usages'));
                            callback(_.map(categoriesCollection.at(0).get('usages'), function(usage) {
                                return usage.usage;
                            }));
                        }
                    },
                    service: {
                        type: 'Select',
                        options: function(callback, editor) {
                            callback(categoriesCollection.map(function(model) {
                                return model.get('service');
                            }));
                        }
                    },
                } }
            }

            this.form = new Backbone.Form({
                model: this.model,
                schema: _.extend(this.model.schema, categoriesSchema)
            });

            this.form.on('services:axe:change', function(form, titleEditor, extra) {
                console.log('Title changed to "' + titleEditor.getValue() + '".');
            });
        },

        render: function () {
            this.form.render();

            if (typeof this.model.id === "undefined")
                this.$el.html(this.templateNew());
            else
                this.$el.html(this.templateEdit());

            this.$el.find('.form-container').append(this.form.el);

            return this;
        },

        submitForReview: function(e) {
            e.preventDefault();
            for(var attr in this.model.attributes) {
                var input = this.$el.find('*[name="'+attr+'"]');
                if(input.length > 0) {
                    this.model.set(attr, input.val());
                }
            }
            this.model.sync(
                'create',
                this.model,
                {url: atlaas.CONFIG.elasticsearch + '/review/' + this.model.id}
            );
            atlaas.router.navigate("", {trigger: true});
        }

    });

})();