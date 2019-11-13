namespace DWTS {

    declare var App;

    export class BaseDialogVM extends ViewModel {
        protected finishDfd: JQueryDeferred<any> = DW.Deferred();
        public finished: JQueryPromise<any>;
        protected options: DW.IBaseDialogOptions;
        private closeConfirmation: JQuery;
        public confirm: DW.Command;
        public noConfirm: DW.Command;
        public cancel: DW.Command;
        constructor(options) {
            super();

            this.finished = this.finishDfd.promise();
            this.options = $.extend({
                resources: {
                    getConfirmTextTitle: function () {
                        return App.getResource("DiscardingChanges_Default_Title");
                    },
                    getConfirmText: function () {
                        return App.getResource('AreYouSure_Text');
                    },
                    getConfirmOkText: function () {
                        return App.getResource('Button_OK_Text');
                    },
                    getConfirmCancelText: function () {
                        return App.getResource('Button_Cancel_Text');
                    }
                }
            }, options);

            this.confirm = this.addDisposable(extend(new DW.Command(), {
                execute: () => {
                    return this.saveDialog()
                        .done((result) => this.finishDfd.resolve(result))//we need this dialog when we create result list from search dialog wizard
                        .fail((error) => DW.Utils.handleError(error));
                },

                canExecute: (isExecuting, requires) => { return !isExecuting && this.hasChanges() && !this.isDialogBusy() }

            }, this.options.confirm ? this.options.confirm : {}));

            this.noConfirm = this.addDisposable(extend(new DW.Command(), {
                execute: () => {
                    return this.saveDialogForced()
                        .done((result) => this.finishDfd.resolve(result))//we need this dialog when we create result list from search dialog wizard
                        .fail((error) => DW.Utils.handleError(error));
                },

                canExecute: (isExecuting, requires) => { return !isExecuting && !this.isDialogBusy() }

            }, this.options.noConfirm ? this.options.noConfirm : {}));

            this.cancel = this.addDisposable(extend(new DW.Command(), {
                execute: () => {
                    if (!this.hasChanges()) {
                        this.finishDfd.reject();//we need to reject when we cancel the operation
                        return;
                    }
                    this.confirmClose(this.options.resources.getConfirmTextTitle.call(this),
                        this.options.resources.getConfirmText(),
                        ((confirm) => {
                            if (confirm === true) {
                                this.discardChanges();
                                this.finishDfd.reject();
                            }
                        })
                    );
                },

                canExecute: (isExecuting, requires) => { return !this.isDialogBusy() }
            }, this.options.cancel ? this.options.cancel : {}));
        }

        //implement in children
        protected name(): string { return '' }
        protected isDialogBusy(): boolean { return false }
        protected hasChanges(): boolean { return false }
        protected validate(): boolean { return true }
        protected applyChanges(): any { }
        protected applyChangesForced(): any { }
        protected discardChanges(): void { }

        protected saveDialog(): JQueryDeferred<any> {
            return DW.Deferred((dfd) => {
                //consider error on apply changes and wnd closing
                if (!this.validate()) dfd.reject();
                else if (this.hasChanges()) DW.When(this.applyChanges()).then(dfd.resolve, dfd.reject);
                else dfd.resolve();
            });
        }

        protected saveDialogForced(): JQueryDeferred<any> {
            return DW.Deferred((dfd) => {
                DW.When(this.applyChangesForced()).then(dfd.resolve, dfd.reject);
            });
        }

        protected confirmClose(title: string, text: string, confirmCallback): void {
            if (!this.closeConfirmation) {
                this.closeConfirmation = toastr.confirm(title, text, confirmCallback, {
                    okText: this.options.resources.getConfirmOkText(),
                    cancelText: this.options.resources.getConfirmCancelText(),
                    closingCallback: () => this.closeConfirmation = null
                });
            }
        }
    }
}