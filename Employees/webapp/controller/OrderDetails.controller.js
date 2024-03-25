sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	function _onObjectMatched(oEvent) {
		this.getView().bindElement({
			path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
			model: "odataNorthwind"
		});
	}

	return Controller.extend("logaligroup.Employees.controller.OrderDetails", {
        onInit: function() {            
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
        },

		onBack: function(onEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRoute = sap.ui.core.UIComponent.getRouterFor(this);
				oRoute.navTo("RouteMain", true);
			}
		}
	});
});