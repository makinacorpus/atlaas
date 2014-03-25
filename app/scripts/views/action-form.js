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
            this.form = new Backbone.Form({
                model: this.model
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