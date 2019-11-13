(function ($, ko) {
    var DisposableDialog = new Class({
        Extends: DW.Dialogs.CustomEscapeDialog,

        initialize: function (getVM, id, options) {
            /// <summary>
            ///     Dialog with custom functionality to dispose it's view model (and itself), when the view model indicates end of all operations
            ///     For that purpose in the view model is defined 'finished' promise. When the deferred for that promise is resolved (or rejected), the dialog starts the dispose mechanism
            /// </summary>
            /// <param name="getVM" type="function">Returns the dialog view model on dialog open</param>
            /// <param name="id"></param>
            /// <param name="options"></param>
            this.getVM = getVM;
            this.parent(id, options);
        },

        finished: function () {
            /// <summary>
            ///     Subscription to the dialog view model finished promise
            ///     On resolve/reject disposes its view model and than itself
            /// </summary>
            return DW.When(this._model.data().finished).always(function () {
                this.close();
                this.destroy();
            }.bind(this));
        },

        open: function () {
            /// <summary>
            ///     Get the dialog view model from the options and give it to the _model.data observable property
            ///     Attach to the dialog view model finished promise
            /// </summary>
            /// <returns type=""></returns>
            this.bind(this.getVM());
            this.finished();
            return this.parent();
        },

        destroy: function () {
            /// <summary>
            ///     Called when the dialog view model resolves/rejects it's finishedDfd deferred
            ///     Dispose the dialog view model
            ///     Dispose the dialog
            /// </summary>
            /// <returns type=""></returns>
            if (this._model.data()) {
                this._model.data().dispose();
                this._model.data(null);
            }

            delete this._model.data;
            delete this._model.escapeWrapper
            delete this._model;

            return this.parent();
        }
    });

    extend(ns('DW.Dialogs'), {
        DisposableDialog: DisposableDialog
    });

})(jQuery, ko);
