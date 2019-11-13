declare module DW {
    class UsersAndRolesCache extends DWTS.ViewModel {
        constructor(getAllUsersAndRoles: () => JQueryPromise<any>);
        getUsers(guids?: Array<string>): JQueryPromise<Array<dev.docuware.com.settings.usermanagement.UserHeader>>;
        getRoles(guids?: Array<string>): JQueryPromise<Array<dev.docuware.com.settings.usermanagement.RoleHeader>>;
    }
}