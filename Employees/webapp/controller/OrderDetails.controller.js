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
		},

		onClearSignature: function(oEvent) {
			var signature = this.byId("signature");
			signature.clear();
		},

		factoryOrderDetails: function (listId, oContext) {
			var contextObject = oContext.getObject();
			contextObject.currency = "MXN";
			var unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

			if (contextObject.Quantity <= unitsInStock) {
				var objectListItem = new sap.m.ObjectListItem({
					title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
					number: "{parts: [{path: 'odataNorthwind>UnitPrice'}, " +
									 "{path: 'odataNorthwind>Currency'}], " +
							 "type:'sap.ui.model.type.Currency', formatOptions: {showMeasure: false}}",
					numberUnit: "{odataNorthwind>Currency}"
				});
				return objectListItem;
			} else {
				var customListItem = new sap.m.CustomListItem({
					content: [
						new sap.m.Bar({
							contentLeft: new sap.m.Label({
								text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})"}),
							contentMiddle: new sap.m.ObjectStatus({ 
								text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error"
							}),
							contentRight: new sap.m.Label({text: "{parts: [{path: 'odataNorthwind>UnitPrice'}, " +
																		  "{path: 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency'}"})
						})
					]
				});
				return customListItem;
			}
		}
	});
});