/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    atlaas.Views.Map.PoiResultsView = Backbone.View.extend({

        template: JST['app/scripts/templates/poi-results.ejs'],

        el: '.results',

        events: {
            'click .results__item'     : 'clickResultHandler',
            'click .results__bt'       : 'clickOpenResultHandler',
        },

        initialize: function () {
            this.syncResults   = true;
            this.$activeResult = $();
            this.viewCollection = {};

            this.listenTo(this.collection, 'reset', this.render);
            this.listenTo(this.collection, 'add', this.onAddedHandler);
            this.listenTo(this.collection, 'remove', this.onRemovedHandler);
        },

        render: function () {
        },

        onAddedHandler: function (_result) {
            var view = new atlaas.Views.Map.PoiResultView({ model: _result });
            this.addOne(view);
        },

        onRemovedHandler: function (_result) {
            var view = this.viewCollection[_result.id];
            view.remove();
            delete this.viewCollection[_result.id];
        },

        addOne: function (_resultView) {
            this.viewCollection[_resultView.model.id] = _resultView;
            this.$el.append(_resultView.render().el);
        },

        clickResultHandler: function (e) {
            e.preventDefault();

            var $result = $(e.currentTarget);

            var poiId = $result.attr('href');
            this.focusOnSpecificResult($result)
            this.trigger('panToPoi', poiId);
        },

        focusOnSpecificResult: function($result){
            this.$activeResult.removeClass('active');
            this.$activeResult = $result;

            $result.addClass('active');
        },

        clickOpenResultHandler: function (e) {
            e.preventDefault();

            var poiId = $(e.target).attr('href');

            var poiResultView = _.find(this.viewCollection, function(poiResultView){
                return poiResultView.model.id == poiId;
            });

            this.trigger('openResult', poiResultView);
        },

    });

})();
