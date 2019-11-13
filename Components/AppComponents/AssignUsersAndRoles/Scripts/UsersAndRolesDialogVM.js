(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./UsersAndRolesTableVM",
            "../../ToggleItemComponent/Scripts/ToggleItemVM",
            "../../ToggleItemComponent/Scripts/ToggleItemsCommands",
            "../../../ViewModels/BusyTriggerVM",
            "../../../Commands/Scripts/Command"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var UsersAndRolesTableRowVM = new Class({
        Extends: DW.ToggleItem,
        name: '',
        type: '',
        initialize: function (uAndR) {
            this.parent(uAndR);
            this.name = uAndR.setting.Name,
            this.type = uAndR.type;
        }
    });

    var UsersAndRolesDialogVM = new Class({
        Extends: DW.BusyTriggerVM,
        options: {
            getUsersAndRoles: function () {
                return DW.When(App.fcService.getUserHeaders(null), App.fcService.getRoleHeaders(null)).then(
                    function (users, roles) {
                        return DW.FileCabinet.Utils.createRelationSourceItem(users, roles); //todo:replace with this when TFS
                    });
            },
            isUsed: function (guid) {
                return false;
            },
            flushResult: function (data) {
                alert('UsersAndRolesDialogVM flush not handled', data);
            },
            canReturnEmpty: false,
            getTableRowVM: function (options) {
                return DW.AssignUsersAndRolesComponent.DefaultInstances.getTableRowVM(options);
            },
            getSelectAllCommand: function (options) {
                return new DW.SelectAllCommand(options);
            }
        },
        dataSource: null,
        selected: null,
        initialize: function (options) {
            extend(this.options, options || {});

            this.finishDfd = DW.Deferred();
            this.finished = this.finishDfd.promise();
            this.dataSource = ko.observableArray();

            this.parent();

            this.table =
                this.addDisposable(
                    DWTS.UsersAndRolesTableVM.create({
                        items: this.dataSource,
                        options: {
                            behaviourOptions: {
                                filterable: { filterProperty: 'name' }
                            }
                        }
                    }));
            this.table.sortBy('name');
            //TODO: use table templates to remove this line
            this.table.setRowHeight(32);

            this.loadingUsers = this.addBusyTrigger(ko.observable(false));

            this.saveUsersAndRolesCommand = $.extend(new DW.Command(), {
                execute: (function () {
                    this.save();
                }).bind(this),
                canExecute: (function () {
                    if (this.options.canReturnEmpty) return true;
                    else
                        return this.dataSource().some(function (item) {
                            return item.inUse();
                        });
                }).bind(this)
            });

            this.cancel = $.extend(new DW.Command(), {
                execute: (function () {
                    this.close();
                }).bind(this),
            });

            this.selectAll = this.addDisposable(this.options.getSelectAllCommand({
                list: this.table.rows,
                prop: 'inUse'
            }));

            var self = this;
            this._init = DW.Utils.lazyDeferred(function (dfd) {
                self.loadingUsers(true);
                return DW.When(self._initInternal())
                    .done(dfd.resolve)
                    .fail(function (error) {
                        DW.Utils.handleError(error);
                        dfd.reject();
                    })
                    .always(function () {
                        self.loadingUsers(false);
                    });
            });

            this._init();
        },

        _initInternal: function () {
            var self = this;
            return self.options.getUsersAndRoles().then((function (usersAndRoles) {
                var fnSortByName = function (a, b) {
                    return a.setting.name > b.setting.name ? 1 : (a.setting.name < b.setting.name ? -1 : 0);
                };
                usersAndRoles = usersAndRoles.sort(fnSortByName);

                self.dataSource(usersAndRoles.map((function (uAndR) {
                    var item = self.options.getTableRowVM(uAndR);
                    item.inUse(self.options.isUsed(item.data.setting.Guid));
                    return item;
                })));
            }));
        },

        save: function () {
            this.options.flushResult(this.dataSource().filter(function (uAndR) {
                return uAndR.inUse();
            }).map(function (uAndR) {
                return uAndR.data;
            }));
            this.finishDfd.resolve();
        },

        close: function () {
            this.finishDfd.reject();
        }
    });

    extend(ns('DW.AssignUsersAndRolesComponent'), {
        UsersAndRolesDialogVM: UsersAndRolesDialogVM,
        UsersAndRolesTableRowVM: UsersAndRolesTableRowVM
    });

}));