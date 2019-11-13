(function () {
    var AddConnectionToRemoteOrganizationCommand = new Class({
        Extends: DW.Command,
        requires: {
            fcSelectorVM: function (vm) {
                return !!vm.addConnectionToRemoteOrganization;
            }
        },
        canExecute: function (isExecuting, requires) {
            return true;
            //return this.parent(isExecuting, requires) && (requires.data.rights.canModify() || requires.data.rights.canEditDialogs());
        },
        execute: function (requires) {
            if (requires.fcSelectorVM) {
                var fcSelector = requires.fcSelectorVM;
                fcSelector.addConnectionToRemoteOrganization();
            }
        }
    });

    var ChangeFieldsMappingCommand = new Class({
        Extends: DW.Command,
        requires: {
            fcSelectorVM: function (vm) {
                return !!vm.changeFieldsMapping;
            }
        },
        canExecute: function (isExecuting, requires) {

            if (!this.parent(isExecuting, requires)) {
                return false;
            }

            if (requires && requires.fcSelectorVM) {
                return requires.fcSelectorVM.getSelectedSourceFC() && requires.fcSelectorVM.getSelectedTargetFC();
            }

            return false;
        },
        execute: function (requires) {
            if (requires.fcSelectorVM) {
                requires.fcSelectorVM.changeFieldsMapping();
            }
        }
    });

    // Main Commands Bundle
    var CommandsBundle = new Class({
        Extends: DW.Commands.Bundle,
        initialize: function () {
            this.setCommands({
                addConnectionToRemoteOrganizationCommand: { ctor: AddConnectionToRemoteOrganizationCommand },
                changeFieldsMappingCommand: { ctor: ChangeFieldsMappingCommand }
            });

            this.parent();
        }
    });

    extend(ns('DW.FCSelector'), {
        CommandsBundle: CommandsBundle
    });
})();