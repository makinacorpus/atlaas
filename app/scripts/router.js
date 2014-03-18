/*global app, Backbone*/

atlaas.Routers = atlaas.Routers || {};

(function () {
    'use strict';

    atlaas.Routers.AppRouter = Backbone.Router.extend({
    	routes: {
    		""					: "home",
    		"map"				: "home",
    		"map/*subroute"		: "category",
    		"news"				: "news",
            "edit/:action_id"   : "edit",
            "review"            : "reviewlist"
    	}
    });

})();
