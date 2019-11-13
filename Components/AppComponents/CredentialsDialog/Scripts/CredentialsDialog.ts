namespace DW.CredentialsDialog {
    export interface ICredentials {
        username: string;
        password: string;
    }

    var localizationResources = (<any>window).DWResources.CD;
    export function localize(key: string, params?: any) {
        return DW.Utils.format((localizationResources && localizationResources[key]) || key || '', params);
    }

    export class CredentialsDialog extends DW.Dialog {
        constructor(options: DW.DialogOptions = null) {
            super(options || null);
        }

        public showCredentialsDialog(currentUser: string, forcedApplyCallback: boolean = false, showHeaderInfoBox: boolean = false): JQueryPromise<ICredentials> {
            let dfd = DW.Deferred<ICredentials>();
            let dialogVm = new CredentialsDialogVM(currentUser, forcedApplyCallback, showHeaderInfoBox),
                dialog = new DW.Dialog({
                    template: "credentials-dialog",
                    getVM: () => {
                        return dialogVm;
                    },
                    modes: [DW.DialogModes.disposableVM, DW.DialogModes.customEscape, DW.DialogModes.autoSize],
                    options: {
                        title: DW.CredentialsDialog.localize('Credentials_Dialog_Headline'),
                        width: 800,
                        minWidth: 700,
                        minHeight: 200,
                        autoResizablePullChanges: false
                    }
                });

            dialogVm.user(currentUser);

            dialogVm.finished
                .then((result: ICredentials) => {
                    dfd.resolve(result);
                }, (error) => {
                    dfd.reject(error);
                });

            dialog.open();
            return dfd.promise();
        };
    }
}

