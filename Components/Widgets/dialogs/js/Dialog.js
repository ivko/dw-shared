(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "knockout", "./jquery.ui.dialog", "./DialogModes"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var emptyTemplateId = '__dwDialog_emptyTemplate';
    if ($('#' + emptyTemplateId).length === 0) {
        $('<script id="' + emptyTemplateId + '" type="text/html"></script>').appendTo(document.body);
    }

    var getDefaultOptions = function () {
        return {
            id: null,                   //set id only if the modal dialog is created once and then reused multiple times
            element: null,              //main dialog div wrapper
            template: emptyTemplateId,  //dialog content html template
            className: 'dw-dialog',     //css class (classes) to be added to the main dialog div wrapper
            dontApplyBindings: false,
            dialogExtraSpace: 159,                  //autoSize
            autoSizeElement: '.dw-dialog-template', //autoSize
            cancelCommandName: 'cancel',            //customEscape (**)
            debounceUpdatePosition: true,
            options: {
                /*  ----default jqUI options----
                appendTo: 'body',
                buttons: [],
                classes: { "ui-dialog": "ui-corner-all", "ui-dialog-titlebar": "ui-corner-all" },
                draggable: true,
                closeOnEscape: true,
                hide: null,
                show: null,
                width: 300,
                maxWidth: false,
                position: { my: "center", at: "center", of: window },
                title: null,
                */
                modal: true,
                closeText: '',
                autoOpen: false,
                resizable: false,
                height: 'auto',
                minWidth: 600,
                minHeight: 480,
                maxHeight: 1080,
                dialogClass: 'dw-dialogs'
                /*default options that would come later if autoSize mode is used*/
                    //autoResizable: true,
                    //autoResizablePullChanges: true,
                    //dialogClass: 'dw-dialogs buttons-bottom no-close'
                /*default options that would come later if customEscape mpode is used*/
                    //closeOnEscape: false
            },
            modes: [
              /*DW.DialogModes.disposableVM, - if added, the DW.Dialog will wait for the finished deferrd in the dialog VM to be resolved and then it would destroy itself and dispose its VM
                DW.DialogModes.customEscape, - if added, the default DW.Dialog behaviour when pressing the ESC key would be prevented. Instead a 'cancel' dw command from the dialog VM would be executed (**)
                DW.DialogModes.autoSize - adds some autoSizing functionality
              */],
            getVM: function () {
                /// <summary>
                ///     Function that returns the dialog view model. 
                ///     If not provided, this.bind(viewModel) must be explicitely called from outside the dialog
                /// </summary>
                /// <returns type="">the dialog view model</returns>
                return null;
            }
        }
    };

    var Dialog = new Class({
        Implements: [Options, Events],
        bounds: {},
        options: {
            modes: []
        },

        initialize: function (options) {
            var self = this,
                events = ['beforeClose', 'close', 'create', 'drag', 'dragStart', 'dragStop', 'focus', 'open', 'resize', 'resizeStart', 'resizeStop'],
                defaultOptions = getDefaultOptions();

            this.setOptions(options); //set all dialog user defined options: merge options from all DW.Dialog class extenders and constructor arguments

            this.dialogModes = this.options.modes.map(function (mode) {
                var modeVM = new mode(self);
                defaultOptions = $.extend(true, defaultOptions, modeVM.getOptions());
                events = events.concat(modeVM.getEvents()); //acumulate the events defined by the mode

                return modeVM;
            });
    
            this.options = $.extend(true, defaultOptions, this.options); //extend the default dialog and mode options with the dialog user defined options

            //define onBeforeClose, onClose, etc. event functions.
            events.forEach(function (eventName) {
                var fnName = 'on' + eventName.slice(0, 1).toUpperCase() + eventName.slice(1);
                self.options.options[eventName] = function () {
                    var context = self,
                        onEvent = self[fnName],
                        mode = self.dialogModes.find(function (mode) {
                            return !!mode[fnName];
                        });
                        
                    if (mode && mode[fnName]) {
                        onEvent = mode[fnName];
                        context = mode;
                    }
                    if (typeof onEvent === 'function') {
                        onEvent.apply(context, arguments);
                    }

                    self.fireEvent(eventName, arguments);
                };
            }, this);

            this._id = this.options.id;

            //set _element: build the wrapper html for the dialog and attach it to the body
            this._element = this.options.element ? $(this.options.element) :
                $('<div data-bind="template: {name: \'' + this.options.template + '\', data: data, if: data}" />').addClass(this.options.className).appendTo(document.body);

            //set the options to the dialog widget
            this._element.dialog(this.options.options);

            if (!this.options.dontApplyBindings) {
                this.applyBindings();
            } else {
                this._model = {
                    data: ko.observable(null)
                };
            }

            if (this.options.debounceUpdatePosition)
                this.bounds.updatePosition = DW.Utils.debounce(this._updatePosition.bind(this), 300);
            else
                this.bounds.updatePosition = this._updatePosition.bind(this);
            this.bounds.closeAndDestroy = this.closeAndDestroy.bind(this);
            $(window).on('resize', this.bounds.updatePosition);
            $(window).one('unload', this.bounds.closeAndDestroy);

            //make the main dialog div focusable
            $(this._element).attr('tabindex', 0);
        },

        applyBindings: function () {
            /// <summary>
            ///    Applies the binding between the view model and the dialog html. 
            ///    The view model object is saved for the dialog in the _model.data  observable
            /// </summary>
            var model = {
                data: ko.observable(null)
            },
            element = this._element;

            this.dialogModes.forEach(function (mode) {
                model = mode.modifyModel(model);
                element = mode.modifyElement(element);
            });

            this._model = model;
            ko.applyBindings(this._model, element[0]);
        },

        setTitle: function (title) {
            /// <summary>
            ///     Change the dialog title from the one defined in the dialog options to a new one.
            /// </summary>
            /// <param name="title" type="string"></param>
            /// <returns>the dialog</returns>
            this._element.dialog('option', 'title', title);
            return this;
        },

        bind: function (viewModel) {
            /// <summary>
            ///     Saves the dialog view model in the _model.data observable property, so that would update the html of the dialog with the real data
            /// </summary>
            /// <param name="viewModel">the dialog view model</param>
            /// <returns>the dialog</returns>
            if (viewModel)
                this._model.data(viewModel);
            return this;
        },

        _updatePosition: function () {
            this._element.dialog('updatePosition');
        },

        open: function () {
            //getVM may not be provided. In that case .bind(someViewModel) must be explicitely called from outside
            var dialogVM = this.options.getVM();
            if (dialogVM)
                this.bind(dialogVM);

            this.dialogModes.forEach(function (mode) {
                mode.open();
            }.bind(this));

            this._element.dialog('open');
            return this;
        },
        close: function () {
            //Tip: close should NOT call destroy. In most cases we would call close and then destroy or full destroy and we don't want the widget to be destroyed on close
            this._element.dialog('close');
            return this;
        },

        closeAndDestroy: function () {
            if (this._element) {
                this.close();
                this.destroy();
            }
        },

        isOpen: function () {
            return this._element.dialog('isOpen');
        },

        destroy: function () {
            $(window).off('resize', this.bounds.updatePosition);
            $(window).off('unload', this.bounds.closeAndDestroy);

            this._element.dialog('destroy');

            if (!this.options.element) {
                this._element.remove();
                this._element = null;
            }
        }
    });

    Dialog._registry = {};
    Dialog.define = function (options, ExtendedDialog) {
        if (!options.id) {
            throw new Error('NoDialogIdProvided');
        }
        if (Dialog._registry[options.id]) {
            throw new Error('DialogIdAlreadyRegistered');
        }

        var singleton = function () {
            return singleton.instance || (singleton.instance = (ExtendedDialog ? new ExtendedDialog(options) : new Dialog(options)));
        };
        Dialog._registry[options.id] = singleton;
    };
    Dialog.find = function (id) {
        if (!Dialog._registry[id]) {
            throw new Error('UnknownDialogId');
        }

        return Dialog._registry[id]();
    };
    Dialog.destroy = function (id) {
        if (!Dialog._registry[id]) {
            throw new Error('UnknownDialogId');
        }

        if (Dialog._registry[id].instance) {
            Dialog._registry[id].instance = null;
        }
    };
    Dialog.undefine = function (id) {
        if (!Dialog._registry[id]) {
            throw new Error('UnknownDialogId');
        }

        Dialog.destroy(id);
        Dialog._registry[id] = null;
    };

    Dialog.undefineAll = function () {
        /// <summary>
        /// Undefine all windows, which are in the registry.
        /// </summary>
        for (var entry in Dialog._registry) {
            Dialog.undefine(entry);
        }
    };

    this.DW = this.DW || {};
    this.DW.Dialog = Dialog;
}));
