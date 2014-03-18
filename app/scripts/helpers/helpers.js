// Leaflet override marker class
CustomMarker = L.Marker.extend({
    options: {
        id: 0
    }
});

// Offset for panning
L.Map.prototype.panToOffset = function (latlng, offset, zoom, options) {
    var x = this.latLngToContainerPoint(latlng).x - offset[0],
        y = this.latLngToContainerPoint(latlng).y - offset[1],
        point = this.containerPointToLatLng([x, y])
    return this.setView(point, this._zoom, { pan: options })
}

// Offset map bounds
L.Map.prototype.getBoundsWithRightOffset = function (offset) {
    var mapBounds = this.getBounds(),
        pxBounds = this.latLngToContainerPoint(mapBounds.getNorthEast()),
        right = pxBounds.x - offset,
        newMapBounds = L.latLngBounds(mapBounds.getSouthWest(), this.containerPointToLatLng([right, pxBounds.y]));
    return newMapBounds;
}

L.POILayer = L.LayerGroup.extend({
    statics: {
        CLUSTER_THRESHOLD: 8,
    },

    initialize: function () {
        L.LayerGroup.prototype.initialize.apply(this, arguments);
        this._onMap = [];
        this._clustered = true;
        this._clusterLayer = new L.LayerGroup();
        this._clusterDetailLayer = L.markerClusterGroup({ chunkedLoading: true, showCoverageOnHover: false });
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
    	var poiPerDepartment 	= atlaas.CONFIG.elasticsearch + '/actions/_search?source={%22size%22:0,%22facets%22:%20{%22test%22:%20{%22terms%22:%20{%22size%22:100,%22script%22:%20%22doc[%27lieux.region%27].value%22},%22global%22:%20false}}}',
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

    updatePois: function (markers) {
        var oldMarkers = [];
        var newMarkers = [];

        // Removing no longer visible markers
        for (var onmap in this._onMap) {
            if (markers[onmap] === undefined) {
                var layer = this._onMap[onmap];
                delete this._onMap[onmap];
                oldMarkers.push(layer);
            }
        }

        // Adding new markers
        for (var marker in markers) {
            if (this._onMap[marker] === undefined) {
                var layer = markers[marker];
                this._onMap[marker] = layer;
                newMarkers.push(layer);
            }
        }

        if (!this._clustered) {
            this._clusterDetailLayer.removeLayers(oldMarkers);
            this._clusterDetailLayer.addLayers(newMarkers);
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

        // for (var onmap in this._onMap) {
        //     this._clusterDetailLayer.removeLayer(this._onMap[onmap]);
        // }
        this._map.removeLayer(this._clusterDetailLayer);
    },

    __uncluster: function () {
        this._map.removeLayer(this._clusterLayer);

        // for (var onmap in this._onMap) {
        //     // this.addLayer(this._onMap[onmap]);
        //     this._clusterDetailLayer.addLayer(this._onMap[onmap]);
        // }

        this._map.addLayer(this._clusterDetailLayer);
    },

});