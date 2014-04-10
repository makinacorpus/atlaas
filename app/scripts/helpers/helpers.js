atlaas.Helpers = atlaas.Helpers || {};

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

// Custom LayerGroup : double pois layer
    // clusterLayer : pois grouped by department
    // clusterDetailLayer : raw markers clusters
L.POILayer = L.LayerGroup.extend({
    statics: {
        CLUSTER_THRESHOLD: 8,
    },

    initialize: function () {
        L.LayerGroup.prototype.initialize.apply(this, arguments);
        this._onMap = [];
        this._clustered = true;
        this.clusterLayer = new L.LayerGroup();
        this.clusterDetailLayer = L.markerClusterGroup({ showCoverageOnHover: false });
    },

    onAdd: function (map) {
        this._clustered = map.getZoom() < L.POILayer.CLUSTER_THRESHOLD;
        L.LayerGroup.prototype.onAdd.apply(this, arguments);
        map.on('zoomend', this.__onZoomChanged, this);
    },

    onRemove: function () {
        if (this.hasLayer(this.clusterLayer))
            this.removeLayer(this.clusterLayer);
        L.LayerGroup.prototype.onRemove.apply(this, arguments);
        map.off('zoomend', this.__onZoomChanged, this);
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

        this.clusterDetailLayer.removeLayers(oldMarkers);
        this.clusterDetailLayer.addLayers(newMarkers);
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
        this.addLayer(this.clusterLayer);
        console.log('cluster');
        this.removeLayer(this.clusterDetailLayer);
        this.clusterDetailLayer.clearLayers();
        this._onMap = [];
    },

    __uncluster: function () {
        this.removeLayer(this.clusterLayer);
        console.log('uncluster');
        this.addLayer(this.clusterDetailLayer);
    },
});

atlaas.Helpers.JSONtoCSV = function(data) {
    JSONtoCSV.toCSV({
        data: data
    }, function(err, csv) {
        console.log(csv);
    });
}