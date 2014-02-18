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
        this._clustered = null;
        this._clusterLayer = new L.LayerGroup();
    },

    onAdd: function (map) {
        L.LayerGroup.prototype.onAdd.apply(this, arguments);
        map.on('zoomend', this.__onZoomChanged, this);
        map.on('moveend', this.__onViewChanged, this);

        this.loadDepartments();
    },

    onRemove: function () {
        if (this._map.hasLayer(this._clusterLayer))
            this._map.removeLayer(this._clusterLayer);
        L.LayerGroup.prototype.onRemove.apply(this, arguments);
        map.off('moveend', this.__onViewChanged, this);
        map.off('zoomend', this.__onZoomChanged, this);
    },

    loadDepartments: function () {
        $.getJSON('scripts/helpers/departements.geojson')
        .success(L.Util.bind(function (data) {
        	_.each(data.features, function (department) {
        		var lat = department.geometry.coordinates[0];
        		var lng = department.geometry.coordinates[1];
        		this._clusterLayer.addLayer(L.marker([lng, lat]));
        	}, this);

        	this._map.addLayer(this._clusterLayer);
        }, this))
        .error(function () {
        	console.error(arguments);
        });
    },

    loadBBox: function (bounds) {
        // TODO: use bounds to build URL with bbox
        $.getJSON('http://elastic.makina-corpus.net/atlaas/actions/_search?source=%7B%22size%22%3A50%2C%22query%22%3A%7B%22match_all%22%3A%7B%7D%7D%7D')
         .success(L.Util.bind(this.__onLoaded, this))
         .error(L.Util.bind(this.__onErrored, this));
    },

    __onLoaded: function (data) {
        var received = {};
        for (var i=0, n=data.hits.hits.length; i<n; i++) {
            var poi = data.hits.hits[i]._source,
                place = poi.lieux[0];
            layer = L.circleMarker([place.latitude, place.longitude]);
            received[poi.id_action] = layer;
        }

        for (var onmap in this._onMap) {
            if (received[onmap] === undefined) {
                var layer = this._onMap[onmap];
                if (this._map.hasLayer(layer))
                    this.removeLayer(layer);
                delete this._onMap[onmap];
            }
        }

        for (var toadd in received) {
            if (this._onMap[toadd] === undefined) {
                var layer = received[toadd];
                this._onMap[toadd] = layer;
                if (!this.clustered)
                    this.addLayer(layer);
            }
        }
    },

    __onErrored: function () {
        console.error(arguments);
    },

    __onViewChanged: function () {
        if (this._clustered === false) {
            this.loadBBox(this._map.getBounds());
        }
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

L.poiLayer = function () {
    return new L.POILayer(arguments);
};