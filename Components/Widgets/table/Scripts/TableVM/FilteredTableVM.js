//(function () {
//    var FilteredTableViewModel = new Class({
//        Extends: DW.SortableTableViewModel,

//        options: {
//            filterProperty: ''
//        },
//        _filteringTimeOutId: null,
//        initialize: function (items, options) {

//            this.filterText = ko.observable('');
//            this.filterExternalFn = ko.observable();
//            this.parent(items, options);

//            this._isInFiltering = this.addBusyTrigger(ko.observable(false));

//            var startFilteringComputed = this.addDisposable(
//                this.addDisposable(ko.computed(function () {
//                    var items = this.items(), //touch the observable as it was former times... discuss with GN
//                        fn = this.filterExternalFn(),
//                        txt = this.filterText();
//                }, this)).extend({
//                    rateLimit: {
//                        timeout: 1,
//                        method: "notifyWhenChangesStop"
//                    },
//                    notify: 'always'
//                }));

//            this.addDisposable(startFilteringComputed.subscribe(function () {
//                this._isInFiltering(true);
//                // timeout in order to simulate async process - needed for the spinner
//                if (this._filteringTimeOutId) clearTimeout(this._filteringTimeOutId);
//                this._filteringTimeOutId = setTimeout(function () {
//                    this.rows(this.getFilteredRows());
//                    // remove the selection if the selected row is not visible after filtering
//                    if (this.rows.indexOf(this.activeRow()) === -1) {
//                        this.activeRow(null);
//                    }
//                    this._isInFiltering(false);
//                }.bind(this), 0);
//            }, this));


//            //var filteredComputed = this.addDisposable(
//            //   this.addDisposable(ko.computed(this.getFilteredRows, this)).extend({
//            //       rateLimit: {
//            //           timeout: 1,
//            //           method: "notifyWhenChangesStop"
//            //       }
//            //   }));

//            //this.addDisposable(filteredComputed.subscribe(function (newValue) {
//            //    this.rows(newValue);
//            //    // remove the selection if the selected row is not visible after filtering
//            //    if (this.rows.indexOf(this.activeRow()) === -1)
//            //        this.activeRow(null); // this will also set activeRowIndex
//            //}, this));

//        },
//        clearFilter: function () {
//            this.filterText("");
//        },
//        applyAdditionalWork: function (items) {
//            return this.getFilteredItems(items);
//        },
//        getFilteredRows: function () {
//            return this.getFilteredItems(this.items());
//        },
//        getFilteredItems: function (items) {

//            var filter = this.filterText(),
//                filterProperty = this.options.filterProperty,
//                filterBy = (filterProperty || null) && ($.isFunction(filterProperty) ? filterProperty : function (item) {
//                    return ko.unwrap(item[filterProperty]);
//                }),
//                filterFn = this.filterExternalFn();

//            //clean the text so that it can be used as pure string in the RegEx
//            var query = filter.replace(/[\\.\+\*\?\^\$\[\]\(\)\{\}\/'\#\:\!\=\|]/ig, '\\$&');
//            var regex = query.split(' ').filter(function (q) {
//                return q;
//            }).map(function (q) {
//                return new RegExp(q, 'i');
//            });

//            if (filterBy && regex.length) {
//                items = items.filter(function (item) {
//                    var match = true;
//                    regex.forEach(function (r) {
//                        match = match && r.test(filterBy(item));
//                    });
//                    return match;
//                });
//            }
//            if (filterFn) {
//                items = items.filter(filterFn);
//            }

//            return items;
//        },
//        dispose: function () {
//            if (this._filteringTimeOutId) clearTimeout(this._filteringTimeOutId);
//            this.parent();
//        }
//    });

//    Object.append(DW, {
//        FilteredTableViewModel: FilteredTableViewModel
//    });
//})();

