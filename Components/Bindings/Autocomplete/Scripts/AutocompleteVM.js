(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "../../../ViewModels/Disposable", "../../../global", "./AutocompleteListVM"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    /*
    The logic of the autocomplete control layout should be here
    It should encapsulate the objects that will be databind to the HTML
    This will be responsible to execute the logic after marking checkboxes
    It contains all the current elements of the control (instead of living them into the bindings behavior)
    */
    var AutocompleteVM = new Class({
        Extends: DW.Disposable,
        Implements: [Events],
        index: -1,
        fieldId: null,
        visible: null,
        loading: null,
        fieldValue: null,
        lists: {},
        options: {
            fieldValue: null, // observable
            setSelectListValue: $.noop,
            hint: null,  // observable
            hintText: '',
            minListLengthForHint: 13,
            lists: [],
            visible: null
        },

        initialize: function (options) {
            options.visible = options.visible || ko.observable(false);

            this.parent();
            $.extend(this.options, options);
            this.visible = this.options.visible;
            this.fieldId = DW.Utils.uniqueId();
            this.loading = ko.observable(true);
            this.fieldValue = this.options.fieldValue;
            this.initEvents();
            this.initLists();
        },

        initLists: function () {
            this.options.lists.forEach(function (options) {
                var name = options.name,
                    listVM = options.viewModel;
                if (instanceOf(listVM, DW.Autocomplete.AutocompleteListVM) === false) {
                    listVM = new DW.Autocomplete.AutocompleteListVM(listVM);
                }
                listVM.addEvent('onSelectItem', this.selectListItem.bind(this));
                this.lists[name] = listVM;
            }, this);
        },

        forceFiltering: function () {
            //force filtering is not showing the menu but just refresh it. Only changing of visibility shows the menu!
            if (this.visible() == false) {
                this.removeSelection();
                return;
            }
            this.filterData(this.fieldValue());
        },

        init: function () {
            this.forceFiltering();
        },

        filterData: function (value) {
            this.loading(true);

            this.removeSelection();

            var getCallbacks = [],
                doneCallbacks = [],
                args = [].slice.apply(arguments);

            Array.forEach(this.options.lists, function (options) {
                var name = options.name;
                getCallbacks.push(options.dataProvider.getData.apply(options.dataProvider, args));
                doneCallbacks.push(this.lists[name].items);
            }, this);

            //Synchronizing the all groups of data with a deferred promise
            DW.When.apply(null, getCallbacks).then(function () {
                var args = Array.prototype.slice.call(arguments);
                for (var i = 0; i < args.length; i++) {
                    this.doneCallbacks[i].apply(null, [args[i]]);
                }

                this.context.fireEvent('dataReady');

            }.bind({
                context: this,
                doneCallbacks: doneCallbacks
            }));
        },

        getListLength: function () {
            var length = 0;
            Object.forEach(this.lists, function (list) {
                length += list.items().length;
            });
            return length;
        },

        getSelectListsLength: function () {
            var length = 0;
            selectList = this.lists["selectList"];

            if (selectList)
                length += selectList.items().length;

            return length;
        },

        showHint: function () {
            if (!this.options.hint) return;

            if (this.getListLength() >= this.options.minListLengthForHint && !DW.Utils.isRealObject(this.fieldValue.peek())) {
                this.options.hint(this.options.hintText);
            }
            else this.options.hint('');
        },

        hideHint: function () {
            if (this.options.hint) this.options.hint('');
        },

        removeSelection: function () {
            this.index = -1;
            Object.forEach(this.lists, function (list) {
                list.selectedIndex(-1);
            });
        },

        movePrevious: function () {
            if (this.index > 0) {
                this.index--;
                this.refreshIndexes();
            }
        },

        moveNext: function () {
            //this may be +2 if we want to deselect all (nothing is selected as a result of more keyups)
            if (this.index + 1 < this.getListLength()) {
                this.index++;
                this.refreshIndexes();
            }
        },

        refreshIndexes: function () {
            var index = this.index;
            Array.forEach(this.options.lists, function (options) {
                var name = options.name,
                    list = this.lists[name],
                    count = list.items().length;

                if (index < count) {
                    list.selectedIndex(index);
                } else {
                    list.selectedIndex(-1);
                }
                index = Math.max(-1, index - count);
            }, this);
        },

        selectListItem: function (text, data) {
            this._select(text, data);
            this.fireEvent('onSelectItem', arguments);
        },

        isHeighlightActive: function () {
            if (this.index >= 0) {
                return true;
            }
            return false;
        },

        selectCurrentlyHeighlightedItem: function () {
            if (this.index < 0) {
                return;
            }
            Object.forEach(this.lists, function (list) {
                if (list.selectedIndex() > -1) {
                    list.selectItem(list.items()[list.selectedIndex()]);
                }
            });
        },

        getValueFromString: function (val) {
            return val;
        },

        initEvents: function () { },

        _allowDataReady: function () {
            return true;
        },

        _select: function (value, data) {
            this.visible(false);
        },

        clearLists: function () {
            Object.forEach(this.lists, function (list) {
                list.items([]);
            });
        }
    });

    $.extend(true, ns('DW.Autocomplete'), {
        Resources: {
            EmptyResult: "EmptyResult"
        },
        setResources: function (resources) {
            $.extend(DW.Autocomplete.Resources, resources);
        },
        localize: function (key, params) {
            var resources = DW.Autocomplete.Resources;
            return DW.Utils.format((resources && resources[key]) || key || '', params);
        },
        AutocompleteVM: AutocompleteVM,
        BindingHandler: {},
        DataProvider: {}
    });

}));
