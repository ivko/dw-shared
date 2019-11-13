/// <reference path="Relations.ts" />

namespace DW.Relations {
    export class RelationsVM extends DWTS.ViewModel {
        relationItems: KnockoutObservableArray<RelationsTableRowVM>;
        tableVM: DWTS.VirtualTableViewModel<RelationsTableRowVM>;
        newRelations: KnockoutComputed<Array<dev.docuware.com.settings.relations.Relationship>>;
        addUser: DW.Command;
        removeUser: DW.Command;
        private disabledUserGuid: KnockoutObservable<string> = ko.observable("");

        constructor(relations: Array<dev.docuware.com.settings.relations.Relationship>,
            private usersAndRolesCache: DW.UsersAndRolesCache,
            private settingsGuid: string,
            private currentUserGuid: string,
            private relationsSourceType: dev.docuware.com.settings.relations.RelationSettingsType) {
            super();

            this.relationItems = this.createTableRows(relations || []);
            this.tableVM = DWTS.VirtualTableViewModel.create<RelationsTableRowVM>({
                items: this.relationItems,
                options: {
                    behaviours: { sortable: true, filterable: true },
                    behaviourOptions: { filterable: { filterProperty: 'Name' } }
                }
            });
            //computed, used to track the changes in the table for new relationItems() and changes in the RelationsTableRowVM.Rights(observable array)
            this.newRelations = this.newRelationsComputed();

            this.addUser = new DW.Command({
                execute: (requires: any) => {
                    this.openAssingDialog();
                }
            });

            this.removeUser = new DW.Command({
                execute: (requires: any) => {
                    this.removeRowFromTable(this.tableVM.activeRow());
                },
                canExecute: () => {
                    let activeRow = this.tableVM.activeRow();
                    return !!activeRow && this.canModifyRelationRight(activeRow.Guid);
                }
            });
        }

        private canModifyRelationRight(guid: string): boolean {
            return guid !== this.disabledUserGuid();
        }

        private relationsChanged(relations: Array<dev.docuware.com.settings.relations.Relationship>) {
            let adminRelations = relations.filter((r) => { return r.Right === dev.docuware.com.settings.relations.RelationRight.Admin });
            if (adminRelations.length === 1)
                this.disabledUserGuid(adminRelations[0].TargetID);
            else {
                let currentUserItem = this.getRelationItem(this.currentUserGuid);
                if (currentUserItem && currentUserItem.hasAdmin())
                    this.disabledUserGuid(this.currentUserGuid);
                else
                    this.disabledUserGuid("");
            }
        }

        private newRelationsComputed(): KnockoutComputed<Array<dev.docuware.com.settings.relations.Relationship>> {
            return ko.computed<Array<dev.docuware.com.settings.relations.Relationship>>(() => {
                let result = new Array<dev.docuware.com.settings.relations.Relationship>();
                this.relationItems().forEach((row) => {
                    row.Rights().forEach((r) => {
                        result.push({
                            Right: r,
                            TargetID: row.Guid,
                            TargetType: row.type,
                            SourceID: this.settingsGuid,
                            SourceType: this.relationsSourceType
                        });
                    });
                });
                this.relationsChanged(result);
                return result;
            }).extend({ deferred: true });
        }

        private createTableRows(relations: Array<dev.docuware.com.settings.relations.Relationship>) {
            let result = ko.observableArray([]);
            let guids = relations.map((rel) => {
                return rel.TargetID;
            });
            //they can be 2 relations for single user- admin and usage. So we unify the guids and later we check what are the rights for each entry
            guids = guids.unique();
            this.getUserHeaders(guids, relations).then((rows) => {
                rows.forEach((row) => { result.push(row); });
            });
            this.getRoleHeaders(guids, relations).then((rows) => {
                rows.forEach((row) => { result.push(row); });
            });
            return result;
        }

        private getUserHeaders(guids: Array<string>, relations: Array<dev.docuware.com.settings.relations.Relationship>): JQueryPromise<Array<TypedSettingsHeader>> {
            return this.getTypedSettingsHeaders(dev.docuware.com.settings.relations.RelationSettingsType.User, () => { return this.usersAndRolesCache.getUsers(guids) }, relations);
        }

        private getRoleHeaders(guids: Array<string>, relations: Array<dev.docuware.com.settings.relations.Relationship>): JQueryPromise<Array<TypedSettingsHeader>> {
            return this.getTypedSettingsHeaders(dev.docuware.com.settings.relations.RelationSettingsType.Role, () => { return this.usersAndRolesCache.getRoles(guids) }, relations);
        }

        private getTypedSettingsHeaders(type: dev.docuware.com.settings.relations.RelationSettingsType, getHeaders: () => JQueryPromise<Array<dev.docuware.com.settings.interop.SettingsHeader>>, relations: Array<dev.docuware.com.settings.relations.Relationship>): JQueryPromise<Array<TypedSettingsHeader>> {
            return getHeaders().then((headers: Array<dev.docuware.com.settings.interop.SettingsHeader>) => {
                let result = new Array<TypedSettingsHeader>();
                headers.forEach((header: dev.docuware.com.settings.interop.SettingsHeader) => {
                    let newRow = new RelationsTableRowVM(type, header, relations.filterMap((rel: dev.docuware.com.settings.relations.Relationship) => {
                        return header.Guid === rel.TargetID;
                    }, (rel: dev.docuware.com.settings.relations.Relationship) => {
                        return rel.Right;
                    }));
                    result.push(newRow);
                });
                return result;
            });
        }

        private getUsersAndRoles(): any {
            return $.when<any>(this.usersAndRolesCache.getUsers(), this.usersAndRolesCache.getRoles())
                .then((users, roles) => {
                    let result = [];
                    (users || []).forEach((user) => {
                        result.push({
                            setting: user,
                            type: dev.docuware.com.settings.relations.RelationSettingsType.User
                        })
                    });
                    (roles || []).forEach((role) => {
                        result.push({
                            setting: role,
                            type: dev.docuware.com.settings.relations.RelationSettingsType.Role
                        })
                    });
                    //filter already selected items
                    return result.filter((userOrRole) => {
                        return !this.getRelationItem(userOrRole.setting.Guid);
                    });;
                });
        }

        private getRelationItem(guid: string) {
            return this.relationItems().find((item) => { return item.Guid === guid });
        }

        private isAdmin(guid: string) {
            let item = this.getRelationItem(guid);
            if (item)
                return item.Rights().some((r) => {
                    return r == dev.docuware.com.settings.relations.RelationRight.Admin;
                });
            else return false;
        }

        //private getRightsForNewEntries(guid): Array<dev.docuware.com.settings.relations.RelationRight> {
        //    //if (guid === this.currentUserGuid)
        //    //    return [dev.docuware.com.settings.relations.RelationRight.Usage, dev.docuware.com.settings.relations.RelationRight.Admin];
        //    return [dev.docuware.com.settings.relations.RelationRight.Usage];
        //}

        private openAssingDialog() {

            let usersAndRolesApi = new DW.AssignUsersAndRolesComponent.ComponentApi(),

                vm = usersAndRolesApi.getDialogVM({
                    getUsersAndRoles: () => this.getUsersAndRoles(),
                    isUsed: (userGuid) => {
                        return false;
                    },
                    flushResult: (usersAndRoleSettings: Array<{
                        setting: dev.docuware.com.settings.interop.SettingsHeader,
                        type: dev.docuware.com.settings.relations.RelationSettingsType
                    }>) => {
                        //take all selected items and create TypedSettingsHeader with usage right
                        let rows = [];
                        (usersAndRoleSettings).forEach(
                            (userOrRole) => {
                                rows.push(this.addDisposable(
                                    new RelationsTableRowVM(userOrRole.type,
                                        userOrRole.setting,
                                        [dev.docuware.com.settings.relations.RelationRight.Admin, dev.docuware.com.settings.relations.RelationRight.Usage])));
                            });
                        this.relationItems(this.relationItems().concat(rows));
                    },
                    canReturnEmpty: false
                });
            let usersDialog = usersAndRolesApi.getDialog({
                getVM: function () { return vm; }
            });
            usersDialog.setTitle(DW.Relations.localize("Relations_Permission_AddWindow_Title"));

            setTimeout(function () {
                usersDialog.open();
            }, 0);
        }

        private removeRowFromTable(row: RelationsTableRowVM) {
            toastr.confirm(
                DW.Utils.format(DW.Relations.localize('Relations_DeleteUserRolePermission_Title'), row.Name),
                DW.Utils.format(DW.Relations.localize('AreYouSure_Text')),
                (confirm) => {
                    if (confirm === true) {
                        this.removeDisposable(row);
                        row.dispose();
                        this.relationItems.remove(row);
                    }
                }, {
                    okText: DW.Relations.localize('Button_OK_Text'),
                    cancelText: DW.Relations.localize('Button_Cancel_Text')
                }
            );
        }
    }        
}