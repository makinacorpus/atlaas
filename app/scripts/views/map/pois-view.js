/*global atlaas, Backbone, JST*/

atlaas.Views = atlaas.Views || {};

(function () {
    'use strict';

    // POIs view : this view displays POIs on the map and pois in the result list
    atlaas.Views.Map.PoisView = Backbone.View.extend({
        events: {
        },

        initialize: function () {
            this.poiViewCollection          = [];
            this.poiLayer                   = new L.POILayer();

            // Initialy, display a poi summary
            var query = {
                source: JSON.stringify({
                    "size" : 30,
                    "query" : {
                        "match_all" : {}
                    }
                })
            };
            
            this.collection.fetch({ data: query });
            this.listenTo(this.collection, "reset", this.render);

            this.loadDepartments();

            this.poiLayer.addTo(this.el);
        },

        render: function () {
            this.poiLayer.clusterDetailLayer.off('click');

            // PoisView
            this.poiViewCollection = _.map(this.collection.models, function (_model) {
                return new atlaas.Views.Map.PoiView({ model: _model });
            });
            
            // Empty markers
            var markers = {};

            // add markers on map for each poiView
            _.each(this.poiViewCollection, function (poiView) {
                _.each(poiView.markers, function (marker) {
                    markers[marker.options.id] = marker;
                }, this);
            }, this);

            // Display markers
            this.poiLayer.updatePois(markers);

            return this;
        },

        loadDepartments: function () {
            var poiPerDepartment    = atlaas.CONFIG.elasticsearch + '/actions/_search?source={%22size%22:0,%22facets%22:%20{%22test%22:%20{%22terms%22:%20{%22size%22:100,%22script%22:%20%22doc[%27lieux.region%27].value%22},%22global%22:%20false}}}',
                departments         = 'scripts/helpers/regions.geojson';
            
            
            $.when($.getJSON(poiPerDepartment), $.getJSON(departments))
            .done(L.Util.bind(function (pois, departments) {

                var terms = {};
                
                _.each(pois[0].facets.test.terms, function (department) {
                    terms[department.term] = department.count;
                });

                _.each(departments[0].features, function (department) {
                    var lat     = department.geometry.coordinates[0],
                        lng     = department.geometry.coordinates[1],
                        id      = department.properties.CODE_REG,
                        myIcon  = L.divIcon({className: 'regions-cluster-icon', iconSize:null});

                    if(terms[department.properties.CODE_REG]) {
                        myIcon.options.html = '<div><span>'+terms[department.properties.CODE_REG]+'</span></div>';
                        var marker = L.marker([lng, lat], {icon: myIcon});
                        this.poiLayer.clusterLayer.addLayer(marker);
                    }
                }, this);

                this.el.addLayer(this.poiLayer.clusterLayer);
            }, this));
        },

    });

})();
