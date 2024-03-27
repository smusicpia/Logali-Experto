sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
/**
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.core.routing.History} History 
 * @param {typeof sap.m.MessageBox} MessageBox 
 * @param {typeof sap.ui.model.Filter} Filter 
 * @param {typeof sap.ui.model.FilterOperator} FilterOperator 
 * @returns 
 */
function (Controller, History, MessageBox, Filter, FilterOperator) {
	"use strict";

	function _onObjectMatched(oEvent) {
		this.onClearSignature();
		this.getView().bindElement({
			path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
			model: "odataNorthwind",
			events: {
				dataReceived: function (oData) {
					_readSignature.bind(this)(oData.getParameter("data").OrderID,
						oData.getParameter("data").EmployeeID);
				}.bind(this)
			}
		});

		const objContext = this.getView().getModel("odataNorthwind").getContext("/Orders(" +
			oEvent.getParameter("arguments").OrderID + ")").getObject();
		if (objContext) {
			_readSignature.bind(this)(objContext.OrderID, objContext.EmployeeID);
		}
	};

	function _readSignature(orderId, employeeId) {
		//read Signature Image
		this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + orderId + "'," +
			"SapId='" + this.getOwnerComponent().SapId + "'," +
			"EmployeeId='" + employeeId + "')", {
			success: function (data) {
				const signature = this.getView().byId("signature");
				if (data.MediaContent !== "") {
					signature.setSignature("data:image/png;base64," + data.MediaContent);
					signature.setOff();
				} else {
					signature.clear();
					signature.setOn();
				}
			}.bind(this),
			error: function (data) {

			}
		});

		//Bind Files
		let oUploadSet = this.byId("uploadSet");
		oUploadSet.bindAggregation("items", {
			path: 'incidenceModel>/FilesSet',
			filters: [
				new Filter("OrderId", FilterOperator.EQ, orderId),
				new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
				new Filter("EmployeeId", FilterOperator.EQ, employeeId)
			],
			template: new sap.m.upload.UploadSetItem({
				fileName: "{incidenceModel>FileName}",
				mediaType: "{incidenceModel>MimeType}",
				visibleEdit: false
			})
		});
	};

	return Controller.extend("logaligroup.Employees.controller.OrderDetails", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
		},

		onBack: function (onEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRoute = sap.ui.core.UIComponent.getRouterFor(this);
				oRoute.navTo("RouteMain", true);
			}
		},

		onClearSignature: function (oEvent) {
			var signature = this.byId("signature");
			signature.signaturePad.on();
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
								text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})"
							}),
							contentMiddle: new sap.m.ObjectStatus({
								text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error"
							}),
							contentRight: new sap.m.Label({
								text: "{parts: [{path: 'odataNorthwind>UnitPrice'}, " +
									"{path: 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency'}"
							})
						})
					]
				});
				return customListItem;
			}
		},

		onSaveSignature: function (oEvent) {
			const signature = this.byId("signature");
			const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			let signaturePng;
			if (signature.signaturePad._isEmpty) {
				MessageBox.error(oResourceBundle.getText("fillSignature"))
			} else {
				signaturePng = signature.getSignature().replace("data:image/png;base64,", "");
				let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
				let body = {
					OrderId: objectOrder.OrderID.toString(),
					SapId: this.getOwnerComponent().SapId,
					EmployeeId: objectOrder.EmployeeID.toString(),
					MimeType: "image/png",
					MediaContent: signaturePng
				};

				this.getView().getModel("incidenceModel").create("/SignatureSet", body, {
					success: function () {
						MessageBox.information(oResourceBundle.getText("signatureSaved"))
					},
					error: function () {
						MessageBox.error(oResourceBundle.getText("signatureNotSaved"))
					}
				})
			};
		},

		onFileBeforeUpload: function (oEvent) {
			let oItem = oEvent.getParameter("item"),
				oModel = this.getView().getModel("incidenceModel"),
				oBindingContext = oItem.getBindingContext("odataNorthwind"),
				sOrderId = oBindingContext.getProperty("OrderID").toString(),
				sSapId = this.getOwnerComponent().SapId,
				sEmployeId = oBindingContext.getProperty("EmployeeID").toString(),
				sFileName = oItem.getFileName(),
				sSecurityToken = oModel.getSecurityToken();

			let sSlug = sOrderId + ";" + sSapId + ";" + sEmployeId + ";" + sFileName;

			//add token
			let oCustomerHeaderToken = new sap.ui.core.Item({
				key: "X-CSRF-Token",
				text: sSecurityToken
			});

			//add slug
			let oCustomerHeaderSlug = new sap.ui.core.Item({
				key: "Slug",
				text: sSlug
			});

			oItem.addHeaderField(oCustomerHeaderToken);
			oItem.addHeaderField(oCustomerHeaderSlug);
		},

		onFileUploadComplete: function (oEvent) {
			let oUploadSet = oEvent.getSource();
			oUploadSet.getBinding("items").refresh();
		},

		onFileDeleted: function(oEvent) {
			let oUploadSet = oEvent.getSource();
			var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();
			this.getView().getModel("incidenceModel").remove(sPath, {
				success: function() {
					oUploadSet.getBinding("items").refresh();
				},
				error: function() {

				}
			});
		},

		onDownloadFile: function() {
			let oUploadSet = this.byId("uploadSet"),
			oResourceBundle = this.getView().getModel("i18n").getResourceBundle(),
			aItems = oUploadSet.getSelectedItems();

			if (aItems.length === 0) {
				MessageBox.error(oResourceBundle.getText("selectFile"));
			} else {
				aItems.forEach((oItem) => {
					let oBindingContext = oItem.getBindingContext("incidenceModel"),
						sPath = oBindingContext.getPath();
					window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value");
				});
			}
		}
	});
});