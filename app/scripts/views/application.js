/*global app, Backbone, JST*/

app.Views = app.Views || {};

(function () {
    'use strict';

    app.Views.ApplicationView = Backbone.View.extend({

        template: JST['app/scripts/templates/application.ejs']

    });

})();
