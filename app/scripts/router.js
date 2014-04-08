/*global app, Backbone*/

atlaas.Routers = atlaas.Routers || {};

(function () {
    'use strict';

    atlaas.Routers.AppRouter = Backbone.Router.extend({
    	routes: {
    		""					: "home",
    		"map"				: "home",
            "map/actions/:id"   : "poi-detail",
    		"map/actors/:id"	: "actor-filter",
    		// "map/*subroute"		: "category",
    		"news"				: "news",
            "edit/:action_id"   : "edit",
            "new"               : "new",
            "review"            : "reviewlist",
            "login"             : "login"
    	}
    });

})();
