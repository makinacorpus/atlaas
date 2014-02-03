/*global app, Backbone*/

app.Collections = app.Collections || {};

(function () {
    'use strict';

    app.Collections.ApplicationCollection = Backbone.Collection.extend({

        model: app.Models.ApplicationModel

    });

})();
