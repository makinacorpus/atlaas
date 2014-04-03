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
            var services = undefined;
            var currentModel = undefined;

            this.listenTo(categoriesCollection, 'sync', function() {
                currentModel = categoriesCollection.at(0);
                usages = _.values(currentModel.get('usages'));
                selectedUsage = usages[0];
                services = currentModel.getServices(selectedUsage.usage);
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
                            if (editor.value === null) {
                                editor.value = currentModel.get('enjeu_de_developpement');
                            };

                            if (editor.value !== currentModel.get('enjeu_de_developpement')) {
                                currentModel = categoriesCollection.findWhere({ enjeu_de_developpement: editor.value });
                                usages = _.values(currentModel.get('usages'));
                            }

                            callback(categoriesCollection.map(function(model) {
                                return model.get('enjeu_de_developpement');
                            }));
                        }
                    },
                    usage: {
                        type: 'Select',
                        options: function(callback, editor) {
                            if (editor.value === null) {
                                editor.value = selectedUsage.usage;
                            };

                            selectedUsage = currentModel.getUsage(editor.value);
                            services = currentModel.getServices(editor.value);

                            callback(_.map(usages, function(value) {
                                return value.usage;
                            }));
                        }
                    },
                    service: {
                        type: 'Select',
                        options: function(callback, editor) {
                            callback(_.map(services, function(value) {
                                return value.service;
                            }));
                        }
                    },
                } }
            }

            this.form = new Backbone.Form({
                model: this.model,
                schema: _.extend(this.model.schema, categoriesSchema)
            });

            this.form.fields.services.editor.on('item:open add', function(listEditor, itemEditor) {
                var enjeuEditor = itemEditor.modalForm.fields.enjeu_de_developpement.editor;
                var usageEditor = itemEditor.modalForm.fields.usage.editor;
                var serviceEditor = itemEditor.modalForm.fields.service.editor;

                itemEditor.modalForm.fields.usage.editor.on('change', function(itemEditor) {
                    var selectedEnjeu = enjeuEditor.getValue();
                    var selectedUsage = itemEditor.getValue();
                    var servicesList = _.map(currentModel.getServices(selectedUsage), function(value) {
                        return value.service;
                    });

                    serviceEditor.setOptions(servicesList);
                    serviceEditor.setValue(null);
                });
            });

            this.form.fields.services.editor.on('item:close close', function(listEditor, itemEditor) {
                itemEditor.modalForm.fields.usage.editor.off('change');
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