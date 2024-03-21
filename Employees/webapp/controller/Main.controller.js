sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     */
    function (Controller, JSONModel) {
      "use strict";

      return Controller.extend("logaligroup.Employees.controller.Main", {
        onInit: function () {
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

          var oJSONModelLayout = new JSONModel();
          oJSONModelLayout.loadData("./localService/mockdata/Layout.json", false);
          oView.setModel(oJSONModelLayout, "jsonLayout");

          var oJSONModelConfig = new JSONModel({
              visibleID: true,
              visibleName: true,
              visibleCountry: true,
              visibleCity: false,
              visibleBtnShowCity: true,
              visibleBtnHideCity: false
          });

          oView.setModel(oJSONModelConfig, "jsonModelConfig");

          this._bus = sap.ui.getCore().getEventBus();
          this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);
        },

        showEmployeeDetails: function(category, nameEvent, path) {
          var detailView = this.getView().byId("detailEmployeeView");
          detailView.bindElement("jsonEmployees>" + path);
          this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

          var incidenceModel = new JSONModel([]);
          detailView.setModel(incidenceModel, "incidenceModel");
          detailView.byId("tableIncidence").removeAllContent();
        }
      });
    });
  