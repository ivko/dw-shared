//(function () {
//    var TableViewModel = new Class({
//        Extends: DW.BusyTriggerVM,
//        options: {
//            multiSelection: false,
//            keepLastSelected: true
//        },

//        initialize: function (items, options) {
//            $.extend(this.options, options || {});
//            this.parent();
//            this.items = items; // ko.observable array
//            this.rows = ko.observableArray(items());

//            this.addDisposable(this.items.subscribe(function (items) {
//                this.rows(items);
//            }.bind(this)));

//            this.activeRow = ko.observable(null);
//            this.scrollRow = ko.observable(null);
//            this.activeRowIndex = ko.observable(-1);
//            this.selectedItems = ko.observableArray([]);
//            this.addDisposable(this.activeRow.subscribe(function (newRow) {
//                this.activeRowIndex(this.rows.indexOf(newRow));
//            }, this));
//            if (this.options.keepLastSelected) {
//                this._trackSelection();
//            } else if (this.options.multiSelection) {
//                this.addDisposable(this.rows.subscribe(function (rows) {
//                    if (this.rows.indexOf(this.activeRow()) == -1) {
//                        this.setActiveRow(null);
//                    }
//                }, this));
//            }
//        },
//        trackSelection: function () {
//            //track only if it was not tracked by default
//            if (!this.options.keepLastSelected) {
//                this._trackSelection();
//            }
//        },
//        _trackSelection: function () {
//            this.addDisposable(this.rows.subscribe(function (rows) {
//                if (this.rows.indexOf(this.activeRow()) == -1) {
//                    this.selectNextAvailableRow();
//                }
//            }, this));
//        },
//        clearSelection: function () {
//            this.selectedItems.removeAll();
//        },
//        setSelection: function (row, isSelected) {
//            if (!isSelected) {
//                var indx = this.selectedItems.indexOf(row);
//                this.selectedItems.splice(indx, 1);
//            } else if (this.selectedItems.indexOf(row) === -1) {
//                this.selectedItems.push(row);
//            }
//        },
//        changeSelection: function (row, evt) {

//            var selectRange = this.options.multiSelection && evt && evt.shiftKey
//            var selectToggle = selectRange === false && this.options.multiSelection && evt && evt.ctrlKey;
//            var selectSingle = selectRange === false && selectToggle === false;
            
//            if (selectRange) {
//                if (this.activeRow()) {
//                    var dataRows = this.rows();
//                    var thisIndx = dataRows.indexOf(row);
//                    var prevIndx = dataRows.indexOf(this.activeRow());

//                    if (thisIndx == prevIndx) {
//                        return false;
//                    }

//                    if (thisIndx < prevIndx) {
//                        thisIndx = thisIndx ^ prevIndx;
//                        prevIndx = thisIndx ^ prevIndx;
//                        thisIndx = thisIndx ^ prevIndx;
//                    }
//                    var rows = [];
                    
//                    for (; prevIndx <= thisIndx; prevIndx++) {
//                        if (dataRows[prevIndx]) {
//                            rows.push(dataRows[prevIndx]);
//                        }
//                    }

//                    $.each(rows, function(i, ri) {
//                        if (this.selectedItems.indexOf(ri) === -1) {
//                            this.selectedItems.push(ri);
//                        }
//                    }.bind(this));
                    
//                    this.activeRow(rows[rows.length - 1]);
//                    return true;
//                }
//            }
            
//            if (selectSingle) {
//                this.clearSelection();
//            }

//            // get current state
//            var selectedState = this.isRowSelected(row);

//            // toggle state if current mode is toggle
//            this.setSelection(row, selectToggle ? !selectedState : true);

//            // unset active row if current mode is toggle and current row is selected
//            this.activeRow(selectToggle && selectedState ? null : row);

//            return true;
//        },
//        isRowSelected: function (row) {
//            return this.selectedItems.indexOf(row) > -1;
//        },
//        setActiveRow: function (row, scrollToRow) {
//            this.clearSelection();
//            this.activeRow(row);
//            if (!row) {
//                return;
//            }
//            this.setSelection(row, true);
//            if (scrollToRow === true) {
//                this.scrollRow(row);
//                this.scrollRow(null);
//            }
//        },
//        selectNextAvailableRow: function (scrollToRow) {
//            var nextRow = this.rows()[this.activeRowIndex()];
//            if (!nextRow) {
//                nextRow = this.rows()[this.activeRowIndex() + 1];
//                if (!nextRow) {
//                    nextRow = this.rows()[this.activeRowIndex() - 1];
//                }
//            }

//            this.setActiveRow(nextRow, scrollToRow);
//        },
//        dispose: function () {
//            this.rows = null;
//            this.items = null;
//            this.activeRow = null;
//            this.parent();
//        }
//    });

//    //var GroupFilterTableViewModel = new Class({
//    //    Extends: VirtualTableViewModel,

//    //    initialize: function (items, options, groupFilterSettings) {
//    //        ///groupFilterSettings: {groupFilterItemKeys: [], groupFilterByProp: ''}
//    //        this.parent(items, options);

//    //        this.filterKey = ko.observable('all');
//    //        this.addDisposable(this.filterKey.subscribe(function (key) {
//    //            var fn = null;

//    //            this.filterItems.some(function (item) {
//    //                if (item.key !== key) return false;

//    //                fn = item.filterFunc;
//    //                return true;
//    //            });

//    //            this.filterExternalFn(fn);
//    //        }, this));

//    //        this.filterItems = groupFilterSettings.groupFilterItemKeys.map(function (key) {
//    //            return {
//    //                key: key, filterFunc: function (item) {
//    //                    return item[groupFilterSettings.groupFilterByProp] === key;
//    //                }
//    //            }
//    //        });
//    //    }
//    //});

//    Object.append(DW, {
//        TableViewModel: TableViewModel//,
//        //GroupFilterTableViewModel: GroupFilterTableViewModel
//    });
//})();


