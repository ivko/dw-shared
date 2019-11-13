declare module DW {

    export class ToggleItem extends DWTS.BusyTriggerVM {

        data: any;
        inUse: KnockoutObservable<boolean>;

        constructor(data: Object, isUse: boolean);
    }
}
declare module DW.AssignUsersAndRolesComponent {
    export class UsersAndRolesTableRowViewModel extends DW.ToggleItem {
        name: string;
        type: string;

        constructor(uAndR);
    }

    export interface UsersAndRolesDialogVMOptions {
        getUsersAndRoles: () => JQueryDeferred<any>;  //TODO: define type
        isUsed: (string) => boolean;
        flushResult: (any) => void;  //TODO: define type
        canReturnEmpty: boolean;
    }

    export class UsersAndRolesDialogVM extends DWTS.BusyTriggerVM {
        options: UsersAndRolesDialogVMOptions;

        constructor(options);  //TODO: define type

        _initInternal: () => JQueryDeferred<any>;
        dataSource: any;  //TODO: define type
        selected: any;  //TODO: define type
        save: () => any;  //TODO: define type
        close: () => void;
    }
} 
