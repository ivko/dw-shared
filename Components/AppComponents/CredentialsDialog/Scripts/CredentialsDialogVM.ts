namespace DW.CredentialsDialog {
    export class CredentialsDialogVM extends DW.BaseDialogVM {
        public showForcedApply: KnockoutObservable<boolean> = ko.observable<boolean>(false);
        public isBusy: KnockoutObservable<boolean>;
        public user: KnockoutObservable<string>;
        public password: KnockoutObservable<string>;
        public validationError: KnockoutObservable<boolean> = ko.observable(false);
        public loginAsCurrent: DW.Command;
        public showHeaderInfoBox: KnockoutObservable<boolean> = ko.observable<boolean>(false);

        // callback: JQueryPromise; forcedApplyCallback: function<void>;
        constructor(currentUser: string, public forcedApply: boolean = false, private showheaderinfobox: boolean = false) {
            super();

            this.showForcedApply(this.forcedApply);
            this.showHeaderInfoBox(this.showheaderinfobox);
            this.isBusy = ko.observable(false);
            this.user = ko.observable<string>(currentUser).extend({
                required: true
            });
            this.password = ko.observable<string>("").extend({
                required: true
            });
        }
        validate(): boolean {
            let self = this;
            return (self.user() && self.password()) ? true : false;
        }

        applyChanges(): JQueryPromise<ICredentials> {
            this.validationError(false);
            return DW.Utils.resolvedDeferredWithParam({ username: this.user(), password: this.password() });
        }

        applyChangesForced(): JQueryPromise<void> {
            return DW.Deferred<void>((dfd) => {
                toastr.confirm($R("Confirm_OK_Forced_Title"),
                    $R("Confirm_OK_Forced_Text"),
                    ((confirm) => {
                        if (confirm === true) {
                            dfd.resolve();
                        } else {
                            dfd.reject();
                        }
                    }),
                    {
                        okText: $R('Button_Yes_Text'),
                        cancelText: $R('Button_No_Text')
                    });
            });
        }

        hasChanges(): boolean {
            return (this.user() && this.password()) ? true : false;
        }

        actionOnEnter(data: any, event: any): boolean {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                $('#authButtonConfirm').click();
                return false;
            }
            return true;
        }
    }
}