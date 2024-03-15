sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/GroupHeaderListItem"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.m.GroupHeaderListItem} GroupHeaderListItem 
     */
    function (Controller, JSONModel, GroupHeaderListItem) {
        "use strict";

        return Controller.extend("logaligroup.Lists.controller.ListTypes", {
            onInit: function () {
                var oJSONModel =  new JSONModel();
                oJSONModel.loadData("./localService/mockdata/ListData.json");
                this.getView().setModel(oJSONModel);
            },

            getGroupHeader: function (oGroup) {
                var groupHeaderListItem = new GroupHeaderListItem({
                    title : oGroup.key,
                    upperCase : true
                });

                return groupHeaderListItem;
            },

            onShowSelectedRows: function() {
                var standardList = this.getView().byId("standardList");
                var selectedItems = standardList.getSelectedItems();
                var i18nModel = this.getView().getModel("i18n").getResourceBundle();

                if (selectedItems.length === 0){
                    sap.m.MessageToast.show(i18nModel.getText("noSelection"));
                } else {
                    var textMessage = i18nModel.getText("selection");
                    for (var item in selectedItems) {
                        var context = selectedItems[item].getBindingContext();
                        var oContext = context.getObject();
                        textMessage = textMessage + " - " + oContext.Material
                    }

                    sap.m.MessageToast.show(textMessage);
                }
            },

            onDeleteSelectedRows: function() {
                var standardList = this.getView().byId("standardList");
                var selectedItems = standardList.getSelectedItems();
                var i18nModel = this.getView().getModel("i18n").getResourceBundle();

                if (selectedItems.length === 0){
                    sap.m.MessageToast.show(i18nModel.getText("noSelection"));
                } else {
                    var textMessage = i18nModel.getText("selection");
                    var model = this.getView().getModel();
                    var products = model.getProperty("/Products");

                    var arrayId = [];
                    for(var i in selectedItems) {
                        var context = selectedItems[i].getBindingContext();
                        var oContext = context.getObject();

                        arrayId.push(oContext.Id);
                        textMessage = textMessage + " - " + oContext.Material
                    }

                    products = products.filter(function(p) {
                        return !arrayId.includes(p.Id);
                    });

                    model.setProperty("/Products", products);
                    standardList.removeSelections();
                    sap.m.MessageToast.show(textMessage);
                }
            },

            onDeleteRow: function(oEvent) {
                var selectedRow = oEvent.getParameter("listItem");
                var context = selectedRow.getBindingContext();
                var splitPath = context.getPath().split("/");
                var indexSelectedRow = splitPath[splitPath.length-1];
                var model = this.getView().getModel();
                var products = model.getProperty("/Products");
                products.splice(indexSelectedRow, 1);
                model.refresh();
            }
        });
    });