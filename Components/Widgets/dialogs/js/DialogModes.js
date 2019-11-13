(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "knockout"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var DialogDecorator = new Class({

        initialize: function (dialog) {
            this.dialog = dialog;
        },
        getOptions: function () {
            return {};
        },  
        modifyModel: function (model) {
            return model;
        },
        modifyElement: function (element) {
            return element;
        },
        getEvents: function () {
            return [];
        },
        open: function () { }
    });


    var AutoSizeDialogDecorator = new Class({
        Extends: DialogDecorator,

        getOptions: function () {
            return {
                dialogExtraSpace: 159,
                autoSizeElement: '.dw-dialog-template',
                options: {
                    autoResizable: true,
                    autoResizablePullChanges: true, // if true we listen for dialog content size changes
                    dialogClass: 'dw-dialogs buttons-bottom no-close'
                }
            };
        }, 

        getEvents: function () {
            return ['autoSize'];
        },

        onAutoSize: function (event, ui) {
            ui.element.find('.scroll-wrapper').dwScrollbar("update");
            ui.element.find(this.dialog.options.autoSizeElement).eq(0).css('max-height', (ui.maxHeight - this.dialog.options.dialogExtraSpace));
        }
    });


    var DisposableVMDialogDecorator = new Class({
        Extends: DialogDecorator,
        open: function () {
            //     Subscription to the dialog view model finished promise
            //     On resolve/reject disposes its view model and than itself
            DW.When(this.dialog._model.data().finished).always(function () {
                this.disposeVM();
                this.dialog.closeAndDestroy();
            }.bind(this));
        },

        disposeVM: function () {
            /// <summary>
            ///     Called when the dialog view model resolves/rejects it's finishedDfd deferred
            ///     Dispose the dialog view model
            /// </summary>

            if (this.dialog._model.data()) {
                if ($.isFunction(this.dialog._model.data().dispose)) {
                    this.dialog._model.data().dispose();
                }
                this.dialog._model.data(null);
            }

            delete this.dialog._model.data;
            delete this.dialog._model;
        }
    });


    var CustomEscapeDialogDecorator = new Class({
        Extends: DialogDecorator,

        getOptions: function () {
            return {
                cancelCommandName: 'cancel',
                options: {
                    closeOnEscape: false
                }
            };
        },

        modifyModel: function (model) {
            model.escapeWrapper = this.escape.bind(this);
            return model;
        },

        modifyElement: function (element) {
            var parent = element.parent('.dw-dialogs').attr('data-bind', "escKey: escapeWrapper");
            return parent;
        },

        escape: function () {
            /// <summary>
            ///     Function, used as value accesor in the escKey custom binding handler
            ///     Would be executed on ESC key (keydown). It would try to execute a dw command, defined in the view model of the dialog
            ///     If not provided, the default name of the command would be 'cancel'
            /// </summary>
            if (this.dialog._model.data()) {
                var command = this.dialog.options.cancelCommandName;
                this.executeCommand(this.dialog._model.data()[command]);
            }
            else {
                this.dialog.close();
            }
        },

        executeCommand: function (command) {
            /// <summary>
            ///     Creates a binding adapter for the cancel command, and executes it.
            ///     DW.CommandBindingAdapter needs the command that would be executed and the context in which that happens
            /// </summary>
            /// <param name="command" type="dw command"></param>
            if (!command) {
                this.dialog.close();
                return;
            }

            var adapter = new DW.CommandBindingAdapter(command, { $data: this.dialog._model.data() });
            adapter.execute().always(function () { adapter.dispose(); });
        },

        onBeforeClose: function (event) {
            /// <summary>
            ///     Prevents default behaviour of the dialog to just close itself on titlebar close button click
            ///     Execute the custom escape functionality instead
            /// </summary>
            /// <param name="event"></param>
            if ($(event.currentTarget).hasClass('ui-dialog-titlebar-close')) {
                event.preventDefault();
                this.escape();
            }
        }
    });

    this.DW = this.DW || {};
    this.DW.DialogModes = {
        disposableVM: DisposableVMDialogDecorator, //the dialog would dispose its view model after the view model's finished deferred is resolved/rejected
        customEscape: CustomEscapeDialogDecorator,
        autoSize: AutoSizeDialogDecorator
    };

}));
