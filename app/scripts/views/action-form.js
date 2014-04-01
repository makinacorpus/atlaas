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

            var usages = undefined;
            var selectedUsage = undefined;

            this.listenTo(categoriesCollection, 'sync', function() {
                usages = _.values(categoriesCollection.at(0).get('usages'));
                selectedUsage = usages[0];
            });

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
                            console.log(editor);
                            callback(categoriesCollection.map(function(model) {
                                return model.get('enjeu_de_developpement');
                            }));
                        }
                    },
                    usage: {
                        type: 'Select',
                        options: function(callback, editor) {
                            callback(_.map(usages, function(value) {
                                return value.usage;
                            }));
                        }
                    },
                    service: {
                        type: 'Select',
                        options: function(callback, editor) {
                            callback(_.map(selectedUsage.services, function(value) {
                                return value.service;
                            }));
                        }
                    },
                } }
            }

            function test(item) {
                console.log(item);
            }

            this.form = new Backbone.Form({
                model: this.model,
                schema: _.extend(this.model.schema, categoriesSchema)
            });

            this.form.on('services:axe:change', function(form, titleEditor, extra) {
                console.log('Title changed to "' + titleEditor.getValue() + '".');
            });

            console.log(this.form.getEditor('services'));

            this.form.fields.services.editor.on('add', function(listEditor, itemEditor) {
                console.log('User with first name "' + itemEditor.getValue().firstName + '" added.');
            });

            this.form.fields.services.editor.on('item:focus', function(listEditor, itemEditor) {
                console.log('User "' + itemEditor.getValue().firstName + '" has been given focus.');
            });

            this.form.fields.services.editor.on('item:usage:change', function(listEditor, itemEditor, usageEditor) {
                console.log('Last name for user "' + itemEditor.getValue().firstName + '" changed to "' + usageEditor.getValue() +'".');
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