/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.LoginForm = Backbone.View.extend({
        className: 'login-container',

        template: JST['app/scripts/templates/login-form.ejs'],

        events: {
            'click .login-form__bt--login': 'login'
        },

        render: function () {
            this.$el.html(this.template());
            return this
        },

        login: function(e) {
            e.preventDefault();
            atlaas.CONFIG.login = this.$el.find('*[name="login"]').val();
            atlaas.CONFIG.password = this.$el.find('*[name="password"]').val();
            $.ajax({
                // /type/id/_update allows partial update
                url: atlaas.CONFIG.secure_elasticsearch + '/lieux/_mapping',
                type: "GET",
                headers: {
                 'Authorization': "Basic " + btoa(atlaas.CONFIG.login + ":" + atlaas.CONFIG.password)
                }
                }).done(function(){
                    atlaas.router.navigate("review", {trigger: true});
                }).fail(function(){
                    alert("error on authentification, please retry");
                })
        }

    });

})();