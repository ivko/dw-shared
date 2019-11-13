//(function () {
//    var VirtualTableViewModel = new Class({
//        Extends: DW.FilteredTableViewModel,
//        options: {
//            rowHeight: 29,
//            preloadCount: 3,
//            delay: 100
//        },
//        initialize: function (items) {

//            this.parent.apply(this, arguments);

//            // init options
//            this.preloadCount = Math.max(this.options.preloadCount, 3);
//            this.preloadTop = Math.floor((this.preloadCount - 1) / 2);
//            this.preloadBottom = Math.ceil((this.preloadCount - 1) / 2);

//            this.tableHeight = this.addDisposable(ko.observable(0));

//            // table helpers
//            this.topOffset = this.addDisposable(ko.observable(0));
//            this.bottomOffset = this.addDisposable(ko.observable(0));

//            this.currentPageObj = this.addDisposable(ko.observable({ page: 0, dfds: [] }));

//            // subscribe to page, rows and tableHeight
//            this.visibleRows = this.addDisposable(
//                this.addDisposable(ko.computed(this.computeVisiblePages, this)).extend({
//                    rateLimit: {
//                        timeout: this.options.delay,
//                        method: "notifyWhenChangesStop"
//                    }
//                })
//            );
//        },
//        /**
//        * Calculate the 'this.visibleRows' via timeout
//        * @param {Number} offset 
//        * @return {Array} with row view models
//        */
//        computeVisiblePages: function () {
//            // This computed uses rows, currentPage and tableHeight
//            var rowHeight = this.options.rowHeight,
//                tableHeight = this.tableHeight(),
//                currentPage = this.currentPageObj().page,
//                rows = this.rows(),
//                rowsCount = rows.length,
//                pageFrom = Math.max(0, currentPage - this.preloadTop),
//                pageTo = Math.max(0, currentPage + this.preloadBottom) + 1,// Plus One for current page
//                pageCount = pageTo - pageFrom,
//                defArray = this.currentPageObj().dfds; // keep page deferreds

//            //clear page deferreds
//            this.currentPageObj().dfds = [];

//            // get posible offset for current set of pages
//            var startOffset = Math.round(Math.ceil(pageFrom * tableHeight / rowHeight));
//            var endOffset = Math.round(Math.min(startOffset + (pageCount * tableHeight / rowHeight), rowsCount));

//            // set offsets 
//            this.topOffset(startOffset * rowHeight);
//            this.bottomOffset((rowsCount - endOffset) * rowHeight);
//            // ensure resolving of the deferreds on the last action
//            setTimeout(function () {
//                defArray.forEach(function (dfd) {
//                    dfd.resolve();
//                });
//            }, 0);

//            // extract visible rows
//            return rows.slice(startOffset, endOffset);
//        },
//        /**
//        * Calls the setScroll via delay
//        * @param {Number} offset 
//        */
//        scroll: function (offset) {
//            clearTimeout(this.scrollTimeoutId);
//            // check if there are changes based on current row, currentPage
//            this.scrollTimeoutId = this.setScroll.delay(this.options.delay, this, [offset]);
//        },
//        /**
//        * Sets this.currentPageObj and triggers the 'this.visibleRows' calculation
//        * @param {Number} offset 
//        */
//        setScroll: function (offset) {
//            if (this._autoScroll) return;
//            // be sure that the offset exists
//            offset = Math.min(this.rows().length * this.options.rowHeight - this.tableHeight(), offset);
//            // calculate the page
//            this.currentPageObj($.extend({ }, this.currentPageObj(), {page: Math.floor(offset / this.tableHeight())}));
//        },
//        /**
//        * Resize table height
//        */
//        resize: function (size) {
//            // be sure that the tableHeight is not negative value
//            this.tableHeight(Math.max(size.height, 0));
//        },
//        /**
//         * Sets the given row to be active
//         * Scroll/navigate to the row
//         * @param {Row Class} row 
//         * @param {Boolean} scrollToRow 
//         * @return {deferred} promise
//         */
//        setActiveRow: function (row, scrollToRow) {

//            var pageUpdateData = this.checkForPageUpdate(row);

//            if (this.items().length > this.preloadCount && scrollToRow === true) { // && pageUpdateData.isUpdated /// removed due to update of html after the setActiveRow call
//                this._autoScroll = true; // setScroll will change the page back to its original value
//                var baseSetActiveRow = DW.Utils.wrapClassParentMethod(this);
//                return this.precalculateScroll(pageUpdateData.page).then(function () {
//                    baseSetActiveRow(row, scrollToRow);
//                    this._autoScroll = false;
//                }.bind(this));
//            }
//            else {
//                this.parent(row, scrollToRow);
//            }
//        },
//        /**
//         * Checks if the current virtual page will change
//         * @param {Row Class} row 
//         * @return {{ isUpdated: Boolean, page: Number }}
//         */
//        checkForPageUpdate: function (row) {

//            var rowIndex = this.getSortedItems(this.rows()).indexOf(row); // can use rows() instead of items() - the method is called after update /sort/
//            if (rowIndex < 0 || !this.tableHeight())
//                return { isUpdated: false, page: this.currentPageObj().page };

//            var rowIndexHeight = rowIndex * this.options.rowHeight,
//                offset = rowIndexHeight - this.tableHeight() > 0 ? rowIndexHeight - this.tableHeight() : rowIndexHeight,
//                page = Math.floor(offset / this.tableHeight()),
//                isUpdated = !(page === this.currentPageObj().page);

//            return { isUpdated: isUpdated, page: page };
//        },
//        /**
//         * Change the 'this.currentPageObj()' which triggers the "this.visibleRows" precalculation
//         * @param {Number} page 
//         * @return {deferred} promise
//         */
//        precalculateScroll: function (page) {

//            var dfd = new DW.Deferred();
//            this.currentPageObj().dfds.push(dfd);
//            this.currentPageObj($.extend({}, this.currentPageObj(), { page: page, dfds: this.currentPageObj().dfds }));
//            return dfd.promise();
//        },
//        //// if we need to add more timeout listeners funcs
//        //changeCurrentPageNotify: function () {
//        //    var dfd = new DW.Deferred();
//        //    var deffArray = this.currentPageObj().dfds;
//        //    deffArray.push(dfd);
//        //    this.currentPageObj($.extend({}, this.currentPageObj(), { dfds: deffArray }));
//        //    return dfd.promise();
//        //},
//        dispose: function () {
//            clearTimeout(this.scrollTimeoutId);
//            this.scrollTimeoutId = null;

//            this.parent();

//            this.preloadCount = null;
//            this.preloadTop = null;
//            this.preloadBottom = null;
//            this.tableHeight = null;
//            this.topOffset = null;
//            this.bottomOffset = null;
//            this.currentPageObj = null;
//            this.visibleRows = null;
//        }
//    });

//    Object.append(DW, {
//        VirtualTableViewModel: VirtualTableViewModel
//    });
//})();
