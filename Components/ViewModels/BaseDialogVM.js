(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "../global", "./ViewModel"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    var BaseDialogVM = new Class({
        Extends: DW.ViewModel,
        Implements: Options,
        closeConfirmation: null,
        options: {
            resources: {
                getConfirmTextTitle: function () {
                    return $R("DiscardingChanges_Default_Title");
                },
                getConfirmText: function () {
                    return $R('AreYouSure_Text');
                },
                getConfirmOkText: function () {
                    return $R('Button_OK_Text');
                },
                getConfirmCancelText: function () {
                    return $R('Button_Cancel_Text');
                }
            }
        },
        initialize: function (options) {

            this.finishDfd = DW.Deferred();
            this.finished = this.finishDfd.promise();

            this.cancel = this.addDisposable(extend(new DW.Command(), {
                execute: function () {
                    if (!this.hasChanges()) {
                        this.finishDfd.reject();//we need to reject when we cancel the operation
                        return;
                    }

                    this.confirmClose(this.options.resources.getConfirmTextTitle.call(this), this.options.resources.getConfirmText(),
                        (function (confirm) {
                            if (confirm === true) {
                                this.discardChanges();
                                this.finishDfd.reject();
                            }
                        }).bind(this)
                    );
                }.bind(this),
                canExecute: function (isExecuting, requires) {
                    return !this.isDialogBusy();
                }.bind(this)
            }, options ? options.cancel : {}));

            this.confirm = this.addDisposable(extend(new DW.Command(), {
                execute: function () {
                    return this.saveDialog()
                        .done(function (result) {
                            this.finishDfd.resolve(result);//we need this dialog when we create result list from search dialog wizard
                        }.bind(this))
                        .fail(function (error) {
                            DW.Utils.handleError(error);
                        });
                }.bind(this),
                canExecute: (function (isExecuting, requires) {
                    return !isExecuting && this.hasChanges() && !this.isDialogBusy();
                }).bind(this)
            }, options ? options.confirm : {}));

            this.noConfirm = this.addDisposable(extend(new DW.Command(), {
                execute: function () {
                    return this.saveDialogForced()
                        .done(function (result) {
                            this.finishDfd.resolve(result);//we need this dialog when we create result list from search dialog wizard
                        }.bind(this))
                        .fail(function (error) {
                            DW.Utils.handleError(error);
                        });
                }.bind(this),
                canExecute: (function (isExecuting, requires) {
                    return !isExecuting && !this.isDialogBusy();
                }).bind(this)
            }, options ? options.noConfirm : {}));

            this.setOptions(options);

            this.parent();
        },

        name: function () {
            return null;
        },

        hasChanges: function () {
            //implement in children
            return false;
        },

        isDialogBusy: function () {
            //implement in children
            return false;
        },

        saveDialog: function () {
            return DW.Deferred(function (dfd) {
                //consider error on apply changes and wnd closing
                if (!this.validate()) dfd.reject();
                else if (this.hasChanges()) DW.When(this.applyChanges()).then(dfd.resolve, dfd.reject);
                else dfd.resolve();
            }.bind(this));
        },

        saveDialogForced: function() {
            return DW.Deferred(function (dfd) {
                DW.When(this.applyChangesForced()).then(dfd.resolve, dfd.reject);
            }.bind(this));
        },

        confirmClose: function (title, text, confirmCallback) {
            if (this.closeConfirmation) {
                this.closeConfirmation.data('toastr-api').forceClose();
                return;
            }
            this.closeConfirmation = toastr.confirm(title, text, confirmCallback, {
                okText: this.options.resources.getConfirmOkText(),
                cancelText: this.options.resources.getConfirmCancelText(),
                closingCallback: function () {
                    this.closeConfirmation = null;
                }.bind(this)
            });
        },

        discardChanges: function () {
            //implement in children
        },

        applyChanges: function () {
            //implement in children
        },

        applyChangesForced: function () {
            //implement in children
        },

        validate: function () {
            return true;
        }
    });

    extend(ns('DW'), {
        BaseDialogVM: BaseDialogVM
    });
}));
