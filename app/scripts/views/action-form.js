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
            });

            var categoriesSchema = {
                services: { type: 'List', itemType: 'Object', subSchema: {
                    axe: {
                        type: 'Select',
                        options: function(callback, editor) {
                            callback('<option>'+ editor.value +'</option>');
                            // callback(categoriesCollection.map(function(model) {
                            //     return model.get('axe');
                            // }));
                        }
                    },
                    enjeu_de_developpement: {
                        type: 'Select',
                        options: function(callback, editor) {
                            if (editor.value === null) {
                                // default to no selection
                                editor.$el.prop('selectedIndex', -1);
                            }

                            if (editor.value !== null) {
                                currentModel = categoriesCollection.findWhere({ enjeu_de_developpement: editor.value });
                                usages = _.values(currentModel.get('usages'));
                            }

                            // if (editor.value !== currentModel.get('enjeu_de_developpement')) {
                            //     currentModel = categoriesCollection.findWhere({ enjeu_de_developpement: editor.value });
                            //     usages = _.values(currentModel.get('usages'));
                            // }

                            callback(categoriesCollection.map(function(model) {
                                return model.get('enjeu_de_developpement');
                            }));
                        }
                    },
                    usage: {
                        type: 'Select',
                        options: function(callback, editor) {
                            if (editor.value !== null) {
                                selectedUsage = editor.value;
                                services = selectedUsage === null ? null : currentModel.getServices(selectedUsage);
                            };

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
                var enjeuEditor     = itemEditor.modalForm.fields.enjeu_de_developpement.editor,
                    usageEditor     = itemEditor.modalForm.fields.usage.editor,
                    serviceEditor   = itemEditor.modalForm.fields.service.editor;
                
                if (enjeuEditor.value === null) {
                    // default to no selection
                    enjeuEditor.$el.prop('selectedIndex', -1);
                }

                enjeuEditor.on('change', function(itemEditor) {
                    var selectedEnjeu = enjeuEditor.getValue();
                    currentModel = categoriesCollection.findWhere({ enjeu_de_developpement: selectedEnjeu });
                    usages = currentModel.get('usages');
                    var usagesList = _.map(usages, function(value) {
                        return value.usage;
                    });

                    usageEditor.setOptions(usagesList);
                    serviceEditor.setOptions();
                    serviceEditor.setValue(null);
                });

                usageEditor.on('change', function(itemEditor) {
                    selectedUsage = itemEditor.getValue();
                    services = currentModel.getServices(selectedUsage);
                    var servicesList = _.map(services, function(value) {
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