namespace DWTS {

    export var VirtualTableDataRetrieverFactory = {
        get<T>(columns, items, loadItems?): DWTS.Interfaces.Tables.ITableDataProvider<T> {
            if (loadItems)
                return new VirtualTableDataProvider<T>(columns, items, loadItems);
            return new TableDataProvider<T>(columns, items);

        }
    };

    export class VirtualTableViewModel<T> extends TableViewModel<T> implements DWTS.Interfaces.Tables.IVirtualTable<T> {
        protected options: DWTS.Interfaces.Tables.IVirtualTableOptions<T>;

        public topOffset: KnockoutObservable<number> = ko.observable(0);
        public bottomOffset: KnockoutObservable<number> = ko.observable(0);
        public visibleRows: KnockoutObservableArray<T> = ko.observableArray([]).trackHasItems();

        protected preloadCount: number;
        protected preloadTop: number;
        protected preloadBottom: number;
        protected scrollTimeoutId: number;
        protected scrollOffset: number = 0;
        protected tableHeight: KnockoutObservable<number> = ko.observable(0);
        protected currentPageObj: KnockoutObservable<any> = ko.observable({ page: 0, dfds: [] });

        private rowHeight: KnockoutObservable<number> = ko.observable(0);
        private visibleRowsQuery: DWTS.Interfaces.Tables.ITableDataProviderQuery = {
            range: new Range(-1, -1)
        };
        private autoScroll: boolean;
        private loadingItems: boolean = false;

        public type: TableType = TABLE_TYPES.virtual;

        constructor(params: DWTS.Interfaces.Tables.IVirtualTableParams<T>,
            dataProvider = VirtualTableDataRetrieverFactory.get<T>(params.options.columns, params.items, params.options.loadItems),
            behavioursFactory = VirtualTableViewModel.tableBehavioursFactory) {
            super(params, dataProvider, behavioursFactory);
            // init options
            this.preloadCount = Math.max(this.options.preloadCount, 3);
            this.preloadTop = Math.floor((this.preloadCount - 1) / 2);
            this.preloadBottom = Math.ceil((this.preloadCount - 1) / 2);

            if (this.options.scrollView) {
                this.options.scrollView.addObserver(this);
            }
            this.prepareInitialSorting();
            //this.prepareInitialFiltering();

            this.initVisibleRows()
                .done(() => {
                    this.sizeReady()
                        .done(() => {
                            this.initVisibleRowsComputing();
                        });
                });
        }

        public static create<T>(
            params: DWTS.Interfaces.Tables.IVirtualTableParams<T>,
            dataProvider?: DWTS.Interfaces.Tables.ITableDataProvider<T>,
            behavioursFactory?: <T>(options: DWTS.Interfaces.Tables.IBaseTableOptions<T>, dataProvider: DWTS.Interfaces.Tables.ITableData<T>) => { [behaviour: string]: DWTS.Interfaces.Tables.ITableBehaviourVM<T> }): VirtualTableViewModel<T> {

            let assembledParams = this.assembleParams(params);
            //TODO: add to assembleParams
            dataProvider = dataProvider || VirtualTableDataRetrieverFactory.get<T>(assembledParams.options.columns, assembledParams.items, assembledParams.options.loadItems);

            return new VirtualTableViewModel<T>(assembledParams, dataProvider, behavioursFactory).init();
        }

        public static assembleParams<T>(params: DWTS.Interfaces.Tables.IVirtualTableParams<T> = {}): DWTS.Interfaces.Tables.IVirtualTableParams<T> {
            let defaultParams = TableViewModel.assembleParams(params);
            let defaultOptions = defaultParams.options;

            let {
                options = <DWTS.Interfaces.Tables.IVirtualTableOptions<T>>defaultOptions
            } = params;

            let {
                manageSelection = defaultOptions.manageSelection,
                multiSelection = defaultOptions.multiSelection,
                columns = defaultOptions.columns,
                behaviours = defaultOptions.behaviours,
                behaviourOptions = defaultOptions.behaviourOptions,
                //defaults ...
                preloadCount = 3,
                delay = 100,
                scrollView,
                loadItems = null,
            } = options;

            return {
                items: defaultParams.items,
                options: {
                    manageSelection,
                    multiSelection,
                    columns,
                    preloadCount,
                    delay,
                    scrollView,
                    behaviours,
                    behaviourOptions,
                    loadItems
                }
            };
        }

        public init(): VirtualTableViewModel<T> {
            super.init();

            return this;
        }

        public static tableBehavioursFactory<T>(options: DWTS.Interfaces.Tables.IVirtualTableOptions<T>, dataProvider: DWTS.Interfaces.Tables.ITableData<T>): { [behaviour: string]: DWTS.Interfaces.Tables.ITableBehaviourVM<T> } {
            let filterable: DWTS.Interfaces.Tables.ITableBehaviourVM<T> = null,
                sortable: DWTS.Interfaces.Tables.ITableBehaviourVM<T> = null;

            if (options.behaviours.sortable) {
                sortable = SortableTableBehaviourVM.create<T>(options.behaviourOptions.sortable, dataProvider);
            }
            if (options.behaviours.filterable) {
                filterable = FilterTableBehaviourVM.create<T>(options.behaviourOptions.filterable, (!options.loadItems && sortable) || dataProvider);
            }
            return {
                sortable: sortable || new BaseTableSortBehaviourVM<T>({}, dataProvider),
                filterable: filterable || new BaseTableFilterBehaviourVM<T>({}, dataProvider)
            };
        }

        private prepareInitialSorting() {
            let sortableColumns = this.sortBehaviour.getSelectedSortableColumns();
            if (sortableColumns && sortableColumns.length) {
                this.visibleRowsQuery.sortByColumn = sortableColumns[0];
            }
        }

        private prepareInitialFiltering() {
            let filterText = this.filterBehaviour.filterText();
            if (filterText) {
                this.visibleRowsQuery.filter = {
                    filterText
                };
            }
        }

        private initVisibleRowsComputing(): void {
            //TODO: check if we can attach extend call directly to the computed and have only one addDisposable call
            this.addDisposable(
                this.addDisposable<any>(
                    ko.computed(() => this.computeVisiblePages())
                ).extend({ deferred: true }));
        }

        private initVisibleRows(): JQueryPromise<void> {
            if (this.dataProvider.isVirtual) return DW.Utils.resolvedDeferred;

            let rowsInitialized = DW.Deferred<void>();

            if (this.setSampleVisibleRows(this.rows())) {
                rowsInitialized.resolve();
            } else {
                let rowsInitListener = this.rows.subscribe((rows) => {
                    if (this.setSampleVisibleRows(rows)) {
                        rowsInitialized.resolve();
                        rowsInitListener.dispose();
                    }
                }, this);
            }

            return rowsInitialized.promise();
        }

        /**
         *  Sets minimal visible rows only until calculations are done
         *
         * @param rows - currently available row data
         */
        private setSampleVisibleRows(rows: T[]): boolean {
            if (rows) {
                this.visibleRows(rows.slice(0, 2));
            }
            return !this.visibleRows.isEmpty();
        }

        private sizeReady(): JQueryPromise<void> {
            let ready = DW.Deferred<void>();

            let sizeListener = ko.computed(() => {
                if (this.isSizeReady()) {
                    ready.resolve();
                }
            });

            return ready
                .always(() => sizeListener.dispose())
                .promise();
        }

        private isSizeReady() {
            return this.rowHeight() !== 0 && this.tableHeight() !== 0;
        }

        public onVisibleRowsChange(callback): void {
            this.addDisposable(
                this.visibleRows.subscribe(function (rows) {
                    callback(rows);
                })
            );
        }

        //Please add here all things that have to be reset, in order to restore table's purity
        public reset(): void {
            this.resetScroll();
        }

        public resetScroll(): void {
            this.scroll(0);
        }

        public setRowHeight(height: number = 0) {
            if (this.rowHeight() !== height && height > 0) {
                this.rowHeight(height);
            }
        }

        public reloadItems(rowIndex: number = 0, scrollToRow: boolean = true): JQueryPromise<void> {
            this.resetScroll();
            this.dataProvider.reset();
            this.visibleRowsQuery.range = this.getVisibleRowsRange();
            return this.loadItemsInternal().done(() => {
                this.setActiveRow(this.visibleRows()[rowIndex], scrollToRow);
            });
        }

        private getRowsCount(): number {
            return this.dataProvider.getCount();
        }

        protected updateOffsets(visibleRowsRange: IRange): void {
            let rowHeight = this.rowHeight(),
                rowsCount = this.getRowsCount(),
                pageDfds = this.currentPageObj().dfds; // after we clean the dfds, we will still hold a reference to them here, so we can resolve them

            //clear page deferreds
            this.currentPageObj().dfds = [];

            this.topOffset(visibleRowsRange.getStart() * rowHeight);
            this.bottomOffset((rowsCount - visibleRowsRange.getEnd()) * rowHeight);

            // ensure resolving of the deferreds on the last action
            setTimeout(() => {
                pageDfds.forEach((dfd) => {
                    dfd.resolve();
                });
            }, 0);
        }

        private getVisibleRowsRange(): IRange {
            if (!this.isSizeReady()) return new Range(0, 0);

            let rowHeight = this.rowHeight(),
                tableHeight = this.tableHeight(),
                currentPage = this.currentPageObj().page,
                maxCapacity = this.calculateMaxContainerCapacity(),
                maxPage = Math.ceil(maxCapacity / tableHeight) - 1, // -1. for zero-based
                pageFrom = Math.max(0, currentPage - this.preloadTop),
                pageTo = Math.min(maxPage, currentPage + this.preloadBottom),
                pageCount = pageTo - (pageFrom - 1); // -1, to include the pageFrom

            // offset to the start and end of the pages we are interested in
            let startOffset = Math.ceil(pageFrom * tableHeight),
                pagesHeight = pageCount * tableHeight,
                endOffset = Math.floor(startOffset + pagesHeight),
                startRowsOffset = Math.ceil(startOffset / rowHeight),
                endRowsOffset = 0;

            if (this.dataProvider.finalCountFound) {
                endOffset = Math.min(maxCapacity, endOffset); // last page may be partial 
                endRowsOffset = Math.min(Math.ceil(endOffset / rowHeight), this.getRowsCount()); // + 1;
            }
            else {
                //don't limit the end offset range with a possible rows count
                endRowsOffset = Math.ceil(endOffset / rowHeight);
            }

            return new Range(
                startRowsOffset,
                //TODO: end should not need a correction
                endRowsOffset // + 1;
            );
        }
        /**
      * Checks if the query range needs update and updates it
      *
      * @return {boolean} has range been updated
      */
        private updateQueryRange(futureQueryRange: IRange): boolean {
            //TODO: the range should be updated when passing from 3 to 2 visible pages count, so the visible rows count can be recalculated
            let isQueryRangeChangeRequired = !futureQueryRange.equals(this.visibleRowsQuery.range);
            if (isQueryRangeChangeRequired) {
                this.visibleRowsQuery.range = futureQueryRange;
            }
            return isQueryRangeChangeRequired;
        }

        private clearVisibleRows() {
            this.visibleRows().forEach((row) => {
                if ((<any>row).dispose) (<any>row).dispose();
            });
        }

        private loadItemsInternal(): JQueryPromise<any> {
            if (this.loadingItems) return DW.Utils.rejectedDeferred;

            this.loadingItems = true;
            return this.addBusyPromise(this.dataProvider.loadItems(this.visibleRowsQuery)).done((items) => {
                this.visibleRowsQuery = { range: this.visibleRowsQuery.range };
                if (this.dataProvider.isVirtual) {
                    this.dataProvider.setProcessedItems(items);
                }
                else {
                    this.visibleRows(items);
                    this.checkRangeAndUpdate();
                }         
            }).always(() => {
                this.loadingItems = false;
            });
        }
        private checkRangeAndUpdate() {
            let count = this.dataProvider.getCount();
            if (this.visibleRowsQuery.range.getEnd() > count) {
                this.visibleRowsQuery.range.setEnd(count);
            }
            this.updateOffsets(this.visibleRowsQuery.range);
        }

        public setProcessedItems(items: T[], processedItemsOptions?: DWTS.Interfaces.Tables.ProcesssedItemsOptions): void  {
            //items - sorted or filtered items
            if (this.dataProvider.isVirtual) {
                this.clearVisibleRows();
                this.activeRow(null);
                this.visibleRows(items);   

                if (this.visibleRowsQuery) {
                    this.visibleRowsQuery.range = this.getVisibleRowsRange();
                    this.checkRangeAndUpdate();
                }
            }
            else {
                super.setProcessedItems(items, processedItemsOptions);
                if (this.visibleRowsQuery && this.visibleRowsQuery.range.getEnd() !== -1) {
                    this.visibleRowsQuery.range = this.getVisibleRowsRange();
                    this.loadItemsInternal();
                }
            }
        }

        /**
        * Calculate the 'this.visibleRows' via timeout
        * @param {Number} offset 
        * @return {Array} with row view models
        */
        public computeVisiblePages(): JQueryPromise<void> {
            let futureQueryRange = this.getVisibleRowsRange();

            if (this.updateQueryRange(futureQueryRange)) {
                return this.loadItemsInternal();
            } else {
                this.updateOffsets(futureQueryRange)
                return DW.Utils.resolvedDeferred;
            }
        }

        /**
        * Calls the setScroll via delay
        * @param {Number} offset 
        */
        public scroll(offset: number): void {
            clearTimeout(this.scrollTimeoutId);
            // check if there are changes based on current row, currentPage
            // this.scrollTimeoutId = this.setScroll.delay(this.options.delay, this, [offset]);

            this.scrollTimeoutId = setTimeout(() => this.setScroll(offset), this.options.delay);
        }

        private precalculateCurrentPage(offset: number = this.scrollOffset): void {
            let newPage = this.calculatePage(offset);
            if (newPage != this.currentPageObj().page) {
                this.currentPageObj($.extend({}, this.currentPageObj(), { page: newPage }));
            }
        }

        /**
       * Sets this.currentPageObj and triggers the 'this.visibleRows' calculation
       * @param {Number} offset 
       */
        public setScroll(offset: number): void {
            this.scrollOffset = this.calculateTopOffset(offset);
            this.precalculateCurrentPage();
        }

        private calculatePage(topOffset: number) {
            let tableHeight = this.tableHeight();
            return tableHeight ? Math.floor(topOffset / tableHeight): 0;
        }

        private calculateTopOffset(offset: number) {
            // if (this.autoScroll) return;
            // be sure that the offset exists
            return Math.min(this.getMaxTopOffset(), offset);
        }

        private calculateMaxContainerCapacity(): number {
            return this.getRowsCount() * this.rowHeight();
        }

        private getMaxTopOffset(): number {
            return Math.max(0, this.calculateMaxContainerCapacity() - this.tableHeight());
        }

        /**
        * Resize table height
        */
        public resize(size: any): void {
            // be sure that the tableHeight is not negative value
            this.tableHeight(Math.max(size.height, 0));
            this.precalculateCurrentPage();
        }

        public setActiveRowByID(findItem: (items: T[]) => T) {
            let item = findItem(this.visibleRows());
            if (!item) return;
            this.setActiveRow(item, true);
        }

        /**
        * Sets the given row to be active
        * Scroll/navigate to the row
        * @param {Row Class} row 
        * @param {Boolean} scrollToRow 
        * @return {deferred} promise
        */
        public setActiveRow(row: T, scrollToRow: boolean) {
            if (this.getItems().length > this.preloadCount && scrollToRow === true) { // && pageUpdateData.isUpdated /// removed due to update of html after the setActiveRow call
                this.autoScroll = true; // setScroll will change the page back to its original value
                let newPage = this.checkForPageUpdate(this.rows().indexOf(row)).page;
                return this.addDisposableTask(this.precalculateScroll(newPage)).done(() => {
                    super.setActiveRow(row, scrollToRow);
                    this.autoScroll = false;
                });
            } else {
                super.setActiveRow(row, scrollToRow);
            }
        }

        private checkForPageUpdate(rowIndex: number): { isUpdated: boolean, page: number } {
            if (rowIndex < 0 || !this.tableHeight()) {
                return { isUpdated: false, page: this.currentPageObj().page };
            }

            var rowIndexHeight = rowIndex * this.rowHeight();
            var offset = rowIndexHeight - this.tableHeight() > 0 ? rowIndexHeight - this.tableHeight() : rowIndexHeight,
                page = Math.floor(rowIndexHeight / this.tableHeight()),
                isUpdated = !(page === this.currentPageObj().page);

            return { isUpdated: isUpdated, page: page };
        }

        /**
         * Change the 'this.currentPageObj()' which triggers the "this.visibleRows" precalculation
         * @param {Number} page 
         * @return {deferred} promise
         */
        public precalculateScroll(page: number) {
            var dfd = DW.Deferred();
            this.currentPageObj().dfds.push(dfd);
            this.currentPageObj($.extend({}, this.currentPageObj(), { page: page, dfds: this.currentPageObj().dfds }));
            return dfd.promise();
        }

        //// if we need to add more timeout listeners funcs
        //changeCurrentPageNotify: function () {
        //    var dfd = new DW.Deferred();
        //    var deffArray = this.currentPageObj().dfds;
        //    deffArray.push(dfd);
        //    this.currentPageObj($.extend({}, this.currentPageObj(), { dfds: deffArray }));
        //    return dfd.promise();
        //},
        public dispose(): void {
            clearTimeout(this.scrollTimeoutId);
            this.scrollTimeoutId = null;
            if (this.options.scrollView) {
                this.options.scrollView.removeObserver(this);
            }
            super.dispose();
            this.preloadCount = null;
            this.preloadTop = null;
            this.preloadBottom = null;
            this.tableHeight = null;
            this.topOffset = null;
            this.bottomOffset = null;
            this.currentPageObj = null;
            this.visibleRows = null;
        }
    }

    export function createDummyVirtualTable<T>(): DWTS.Interfaces.Tables.IVirtualTable<T> {
        return $.extend({
            topOffset: ko.observable(0),
            bottomOffset: ko.observable(0),

            onVisibleRowsChange: () => { },
            reset: () => { },
            resetScroll: () => { },
            setRowHeight: () => { },
            computeVisiblePages: [],
            scroll: () => { },
            setScroll: () => { },
            resize: () => { },
            precalculateScroll: () => -1,
        }, DWTS.createDummyTable());
    }  
}
