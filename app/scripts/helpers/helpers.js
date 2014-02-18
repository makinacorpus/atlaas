// Leaflet override marker class
CustomMarker = L.Marker.extend({
    options: {
        id: 0
    }
});


L.POILayer = L.LayerGroup.extend({
    statics: {
        CLUSTER_THRESHOLD: 8,
    },

    initialize: function () {
        L.LayerGroup.prototype.initialize.apply(this, arguments);
        this._onMap = {};
        this._clustered = true;
        this._clusterLayer = L.markerClusterGroup({ chunkedLoading: true, showCoverageOnHover: false, disableClusteringAtZoom: 5 });
    },

    onAdd: function (map) {
        L.LayerGroup.prototype.onAdd.apply(this, arguments);
        map.on('zoomend', this.__onZoomChanged, this);

        this.loadDepartments();
    },

    onRemove: function () {
        if (this._map.hasLayer(this._clusterLayer))
            this._map.removeLayer(this._clusterLayer);
        L.LayerGroup.prototype.onRemove.apply(this, arguments);
        map.off('zoomend', this.__onZoomChanged, this);
    },

    loadDepartments: function () {
    	var poiPerDepartment 	= 'http://elastic.makina-corpus.net/atlaas/actions/_search?source={%22size%22:0,%22facets%22:%20{%22test%22:%20{%22terms%22:%20{%22size%22:100,%22script%22:%20%22doc[%27lieux.departement%27].value%22},%22global%22:%20false}}}',
    		departments 		= 'scripts/helpers/regions.geojson';
    	
    	
    	$.when($.getJSON(poiPerDepartment), $.getJSON(departments))
    	.done(L.Util.bind(function (pois, departments) {

    		var terms = {};
    		
    		_.each(pois[0].facets.test.terms, function (department) {
    			terms[department.term] = department.count;
    		});

    		_.each(departments[0].features, function (department) {
    			var lat 	= department.geometry.coordinates[0],
    				lng 	= department.geometry.coordinates[1],
    				id 		= department.properties.CODE_REG,
    				myIcon 	= L.divIcon({className: 'regions-cluster-icon', iconSize:null});

    			if(terms[department.properties.CODE_REG]) {
    				myIcon.options.html = '<div><span>'+terms[department.properties.CODE_REG]+'</span></div>';
    				var marker = L.marker([lng, lat], {icon: myIcon});
    				this._clusterLayer.addLayer(marker);
    			}
    		}, this);

    		this._map.addLayer(this._clusterLayer);
    	}, this));
    },

    updatePois: function (pois) {
    	this.__onLoaded(pois);

        // TODO: use bounds to build URL with bbox
        // $.getJSON('http://elastic.makina-corpus.net/atlaas/actions/_search?source=%7B%22size%22%3A50%2C%22query%22%3A%7B%22match_all%22%3A%7B%7D%7D%7D')
        //  .success(L.Util.bind(this.__onLoaded, this))
        //  .error(L.Util.bind(this.__onErrored, this));
    },

    __onLoaded: function (markers) {
        // var received = {};
        // for (var i=0, n=markers.length; i<n; i++) {
        //     var poi = markers[i],
        //         place = poi.getLatLng();
        //     layer = L.circleMarker([place.latitude, place.longitude]);
        //     received[poi.id_action] = layer;
        // }

        for (var onmap in this._onMap) {
            if (markers[onmap] === undefined) {
                var layer = this._onMap[onmap];
                if (this._map.hasLayer(layer))
                    this.removeLayer(layer);
                delete this._onMap[onmap];
            }
        }

        for (var marker in markers) {
            if (this._onMap[marker] === undefined) {
                var layer = markers[marker];
                this._onMap[marker] = layer;
                if (!this._clustered)
                    this.addLayer(layer);
            }
        }
    },

    __onErrored: function () {
        console.error(arguments);
    },

    __onZoomChanged: function () {
        var clustered = this._map.getZoom() < L.POILayer.CLUSTER_THRESHOLD;
        if (clustered !== this._clustered) {
            if (!this._clustered) {
                this.__cluster();
            }
            else {
                this.__uncluster();
            }
        }
        this._clustered = clustered;
    },

    __cluster: function () {
        this._map.addLayer(this._clusterLayer);

        for (var onmap in this._onMap) {
            this.removeLayer(this._onMap[onmap]);
        }
    },

    __uncluster: function () {
        this._map.removeLayer(this._clusterLayer);

        for (var onmap in this._onMap) {
            this.addLayer(this._onMap[onmap]);
        }
    },

});