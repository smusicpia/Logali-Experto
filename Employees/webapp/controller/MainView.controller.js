sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Controller, JSONModel, Filter, FilterOperator) {
        "use strict";

        function onInit() {
            var oView = this.getView();

            //var i18nBundle = oView.getModel("i18n").getResourceBundle();
            // var oJSON = {
            //     employeedId: "12345",
            //     countryKey: "UK",
            //     listCountry: [
            //         {
            //             key: "US",
            //             text: i18nBundle.getText("countryUS")
            //         },
            //         {
            //             key: "UK",
            //             text: i18nBundle.getText("countryUK")
            //         },
            //         {
            //             key: "ES",
            //             text: i18nBundle.getText("countryES")
            //         }
            //     ]
            // };
            // oJSONModel.setData(oJSON);

            var oJSONModelEmpl = new JSONModel();
            oJSONModelEmpl.loadData("./localService/mockdata/Employees.json", false);
            // Validar en la consola, que se esten cargando los datos del fichero
            // oJSONModel.attachRequestCompleted(function (oEventModel) {
            //     console.log(JSON.stringify(oJSONModel.getData()));
            // });
            oView.setModel(oJSONModelEmpl, "jsonEmployees");

            var oJSONModelCountries = new JSONModel();
            oJSONModelCountries.loadData("./localService/mockdata/Countries.json", false);
            oView.setModel(oJSONModelCountries, "jsonCountries");

            var oJSONModelConfig = new JSONModel({
                visibleID: true,
                visibleName: true,
                visibleCountry: true,
                visibleCity: false,
                visibleBtnShowCity: true,
                visibleBtnHideCity: false
            });

            oView.setModel(oJSONModelConfig, "jsonModelConfig");
        };

        function onFilter() {
            var oJSONCountries = this.getView().getModel("jsonCountries").getData();

            var filters = [];

            if (oJSONCountries.EmployeeId !== ""){
                filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSONCountries.EmployeeId));
            }

            if (oJSONCountries.CountryKey !== ""){
                filters.push(new Filter("Country", FilterOperator.EQ, oJSONCountries.CountryKey));
            }

            // Update Table
            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);
        };

        function onClearFilter() {
            var oModel = this.getView().getModel("jsonCountries");
            oModel.setProperty("/EmployeeId", "");
            oModel.setProperty("/CountryKey", "");
        }

        function showPostalCode(oEvent) {
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("jsonEmployees");
            var objectContext = oContext.getObject();

            sap.m.MessageToast.show(objectContext.PostalCode);
        }

        function onShowCity() {
            var oJSONModelConfig = this.getView().getModel("jsonModelConfig");
            oJSONModelConfig.setProperty("/visibleCity", true);
            oJSONModelConfig.setProperty("/visibleBtnShowCity", false);
            oJSONModelConfig.setProperty("/visibleBtnHideCity", true);
        }

        function onHideCity() {
            var oJSONModelConfig = this.getView().getModel("jsonModelConfig");
            oJSONModelConfig.setProperty("/visibleCity", false);
            oJSONModelConfig.setProperty("/visibleBtnShowCity", true);
            oJSONModelConfig.setProperty("/visibleBtnHideCity", false);
        }

        function myCheck() {
            var inputEmployee = this.byId("inputEmployee");
            var valueEmployee = inputEmployee.getValue();
            if (valueEmployee.length === 6) {
                //inputEmployee.setDescription("OK");
                this.getView().byId("labelCountry").setVisible(true);
                this.getView().byId("slCountry").setVisible(true);
            } else {
                //inputEmployee.setDescription("Not OK");
                this.getView().byId("labelCountry").setVisible(false);
                this.getView().byId("slCountry").setVisible(false);
            }
        }

        function showOrders(oEvent) {
            var ordersTable = this.getView().byId("ordersTable");
            ordersTable.destroyItems(); //para ir limpiando los items, cuando se pulsa n veces
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("jsonEmployees");

            var objectContext =oContext.getObject();
            var orders = objectContext.Orders;
            var ordersItems = [];
            for(var i in orders) {
                ordersItems.push(new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Label({text: orders[i].OrderID}),
                        new sap.m.Label({text: orders[i].Freight}),
                        new sap.m.Label({text: orders[i].ShipAddress})
                    ]
                }));
            }

            var newTable = new sap.m.Table({
                width: "auto",
                columns: [
                    new sap.m.Column({header: new sap.m.Label({text: "{i18n>orderID}"})}),
                    new sap.m.Column({header: new sap.m.Label({text: "{i18n>freight}"})}),
                    new sap.m.Column({header: new sap.m.Label({text: "{i18n>shipAddress}"})})
                ],
                items: ordersItems
            }).addStyleClass("sapUiSmallMargin");
            ordersTable.addItem(newTable);

            // otra forma de añadir una tabla
            var newTableJSON = new sap.m.Table();
            newTableJSON.setWidth("auto");
            newTableJSON.addStyleClass("sapUiSmallMargin");

            var columnOrderID = new sap.m.Column();
            var labelOrderID = new sap.m.Label();
            labelOrderID.bindProperty("text", "i18n>orderID");
            columnOrderID.setHeader(labelOrderID);
            newTableJSON.addColumn(columnOrderID);

            var columnFreight = new sap.m.Column();
            var labelFreight = new sap.m.Label();
            labelFreight.bindProperty("text", "i18n>freight");
            columnFreight.setHeader(labelFreight);
            newTableJSON.addColumn(columnFreight);

            var columnShipAddress = new sap.m.Column();
            var labelShipAddress = new sap.m.Label();
            labelShipAddress.bindProperty("text", "i18n>shipAddress");
            columnShipAddress.setHeader(labelShipAddress);
            newTableJSON.addColumn(columnShipAddress);

            var columnListItem = new sap.m.ColumnListItem();

            var cellOrderID = new sap.m.Label();
            cellOrderID.bindProperty("text", "jsonEmployees>OrderID");
            columnListItem.addCell(cellOrderID);

            var cellFreight = new sap.m.Label();
            cellFreight.bindProperty("text", "jsonEmployees>Freight");
            columnListItem.addCell(cellFreight);

            var cellShipAddress = new sap.m.Label();
            cellShipAddress.bindProperty("text", "jsonEmployees>ShipAddress");
            columnListItem.addCell(cellShipAddress);

            var oBindingInfo = {
                model: "jsonEmployees",
                path: "Orders",
                template: columnListItem
            };
            newTableJSON.bindAggregation("items", oBindingInfo);
            newTableJSON.bindElement("jsonEmployees>" + oContext.getPath());
            ordersTable.addItem(newTableJSON);
        }
 
        const Main = Controller.extend("logaligroup.employees.controller.MainView", {});

        Main.prototype.onValidate = myCheck
        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onClearFilter = onClearFilter;
        Main.prototype.showPostalCode = showPostalCode;
        Main.prototype.onShowCity = onShowCity;
        Main.prototype.onHideCity = onHideCity;
        Main.prototype.showOrders = showOrders;

        return Main;
    });