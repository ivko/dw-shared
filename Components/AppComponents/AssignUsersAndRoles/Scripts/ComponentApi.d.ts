declare module DW.AssignUsersAndRolesComponent {

    export interface UsersAndRolesComponentApiOptions {
        getResources: () => Object;  //TODO: define type
        getDialog: (Object) => any;
        getDialogVM: (Object) => any;  //TODO: define type
        getTableRowVM: (Object) => any;
    }

    export class ComponentApi extends DWTS.ViewModel {
        options: UsersAndRolesComponentApiOptions;

        constructor(options?: any);

        getDialog: (any) => any;  //change this
        getDialogVM: (any) => any;
    }

}   