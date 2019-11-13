declare namespace DW.ConnectionDialog {
    export class ComponentApi {
        constructor();
        createConnectionDialogVM(options: IConnectionDialogOptions): ConnectionDialogVM;
    }

    export class ConnectionDialogVM extends BaseDialogVM {
        constructor(options: IConnectionDialogOptions);
    }

    export class ConnectionDialogDialog extends Dialog {
        constructor(options: any);
    }

    export interface IConnectionSettings {
        organizationName: string;
        platformUrl: string;
        username: string;
        password: string;
    }

    export interface IConnectionDialogOptions {
        connectionSettings: IConnectionSettings;
        //predefinedCloudSystems: Array<PredefinedCloudSystems>;
    }

    //export class PredefinedCloudSystems {
    //    Url: string;
    //    Name: string;
    //}

    // Example how to call this dialog and how to use the result
    // just call _changeCredentials() in ViewModel
    //
    //
    //
    //private _changeCredentials(): void {
    //    const connDialogCommponentApi = new DW.ConnectionDialog.ComponentApi();
    //
        //const initialConnectionSettings: IConnectionSettings = {
        //    organizationName: 'some organization',
        //    platformUrl: 'http://someplatform/docuware',
        //    username: 'username',
        //    password: 'password'
        //};

        //let vm = connDialogCommponentApi.createConnectionDialogVM({
        //    connectionSettings: initialConnectionSettings
        //});

        //let dialog = this.connDialogCommponentApi.createConnectionDialog({ getVM: function () { return vm; } });

        //vm.finished.done(((connectionSettings: IConnectionSettings) => {
        //    console.log(connectionSettings); // do something with returned result
        //}).bind(this));

        //setTimeout(function () {
        //    dialog.open();
        //}, 0);
    //}
}
