namespace DWTS {
    declare var DW;

    export class UsersAndRolesTableVM<T> extends DWTS.VirtualTableViewModel<T> {

        constructor(params: DWTS.Interfaces.Tables.IVirtualTableParams<T>) {
            super(params);

            this.addDisposable(this.filterKey.subscribe(function (key) {
                this.filterBehaviour.filterExternalFn(this['_' + key + 'DlgFilter'] || null);
            }, this));
        }

        public static create<T>(params: DWTS.Interfaces.Tables.IVirtualTableParams<T>): UsersAndRolesTableVM<T> {
            if (params)
                params.options = $.extend(params, {
                    behaviours: {
                        sortable: true,
                        filterable: true
                    }
                });
            return new UsersAndRolesTableVM(this.assembleParams(params)).init();
        }

        public init(): UsersAndRolesTableVM<T> {
            super.init();

            return this;
        }

        private _usersDlgFilter(item) {
            return item.type === DW.Utils.dwRelationItemTypes.User;
        }

        private _rolesDlgFilter(item) {
            return item.type === DW.Utils.dwRelationItemTypes.Role;
        } 
    }
}  