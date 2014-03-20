/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoiResultsView = Backbone.View.extend({

        template: JST['app/scripts/templates/poi-results.ejs'],

        el: '.results-menu__wrapper',

        events: {
            'click .results-menu__item'     : 'clickResultHandler',
            'click .results-menu__bt'       : 'clickOpenResultHandler',
        },

        initialize: function () {
            this.$activeResult              = $();

            this.listenTo(this.collection, "reset", this.render);
        },

        render: function () {
            // var resultsCollection = this.syncResults ? this.collection : this.searchResultsCollection;

            // ResultViews
            this.poiResultsViewCollection = _.map(this.collection.models, function (_model) {
                return new atlaas.Views.Map.PoiResultView({ model: _model });
            });

            // never display more than the 30 first results in the list (user must zoom/search to acurate)
            this.poiResultsViewCollection = this.poiResultsViewCollection.slice(0, 30);

            this.$el.html(_.map(this.poiResultsViewCollection, function (_result) {
                return _result.render().el;
            }));
        },

        clickResultHandler: function (e) {
            e.preventDefault();

            var $result = $(e.currentTarget);

            this.$activeResult.removeClass('active');
            this.$activeResult = $result;

            $result.addClass('active');
            
            var poiId = $result.attr('href');

            this.trigger('panToPoi', poiId);
        },

        clickOpenResultHandler: function (e) {
            e.preventDefault();

            var poiId = $(e.target).attr('href');

            var poiResultView = _.find(this.poiResultsViewCollection, function(poiResultView){
                return poiResultView.model.id == poiId;
            });

            this.trigger('openResult', poiResultView);
        }

    });

})();
