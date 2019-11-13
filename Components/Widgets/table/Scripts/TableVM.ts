/// <reference path="interfaces/ITableInterfaces.ts" />
/// <reference path="Column.ts" />
/// <reference path="TableDataProvider.ts" />
/// <reference path="DefaultTableBehaviours.ts" />

namespace DWTS {
    export class TableViewModel<T> extends DWTS.BusyTriggerVM implements DWTS.Interfaces.Tables.ITable<T> {
        protected options: DWTS.Interfaces.Tables.IBaseTableOptions<T>;

        public filterText: KnockoutObservable<any>;
        public filterKey: KnockoutObservable<any>;

        public items: KnockoutObservableArray<T>;
        public rows: KnockoutObservableArray<T> = ko.observableArray([]);

        public activeRow: KnockoutObservable<T>;
        protected scrollRow: KnockoutObservable<T>;
        protected selectedItems: KnockoutObservableArray<T>;

        protected dataProvider: DWTS.Interfaces.Tables.ITableDataProvider<T>;
        protected sortBehaviour: DWTS.Interfaces.Tables.IDefaultTableSortBehaviourVM<T>;
        protected filterBehaviour: DWTS.Interfaces.Tables.IDefaultTableFilterBehaviourVM<T>;

        private behaviours: { [behaviour: string]: DWTS.Interfaces.Tables.ITableBehaviourVM<T> };
        private loadingTask: JQueryDeferred<void> = null;
        private loadingPromise: JQueryPromise<void> = null;

        private columnsCount: number;

        public type: TableType = TABLE_TYPES.simple;

        constructor(params: DWTS.Interfaces.Tables.ITableParams<T>,
            dataProvider: DWTS.Interfaces.Tables.ITableDataProvider<T> = new TableDataProvider<T>(params.options.columns, params.items),
            behavioursFactory = TableViewModel.tableBehavioursFactory) {
            super();

            this.setOptions(params.options);

            this.activeRow = ko.observable(null);
            this.scrollRow = ko.observable(null);
            this.selectedItems = ko.observableArray([]);
            this.dataProvider = dataProvider;

            this.behaviours = behavioursFactory<T>(this.options, this.dataProvider);

            this.sortBehaviour = <DWTS.Interfaces.Tables.IDefaultTableSortBehaviourVM<T>>this.behaviours.sortable;
            this.filterBehaviour = <DWTS.Interfaces.Tables.IDefaultTableFilterBehaviourVM<T>>this.behaviours.filterable;

            this.filterText = this.filterBehaviour.filterText;
            this.filterKey = this.filterBehaviour.filterKey;

            this.items = this.dataProvider.items;
            this.initRows();

            for (var behaviour in this.behaviours) {
                if (this.behaviours.hasOwnProperty(behaviour))
                    this.addBusyTrigger(this.behaviours[behaviour].isBusy);
            }
        }

        //public invokeBehaviour(behaviour: string, method: string, options: any): any {
        //    if (this.behaviours[behaviour] && this.behaviours[behaviour].method)
        //        return this.behaviours[behaviour].method(options);
        //}

        //TODO: return interface type ITable instead of the model
        public static create<T>(
            params: DWTS.Interfaces.Tables.ITableParams<T>,
            dataProvider?: DWTS.Interfaces.Tables.ITableDataProvider<T>,
            behavioursFactory?: <T>(options: DWTS.Interfaces.Tables.IBaseTableOptions<T>, dataProvider: DWTS.Interfaces.Tables.ITableData<T>)
                => { [behaviour: string]: DWTS.Interfaces.Tables.ITableBehaviourVM<T> }): TableViewModel<T> {

            let assembledParams = this.assembleParams(params);
            //TODO: add to assembleParams
            dataProvider = dataProvider || new TableDataProvider<T>(assembledParams.options.columns, assembledParams.items);

            return new TableViewModel<T>(assembledParams, dataProvider, behavioursFactory).init();
        }

        protected static assembleParams<T>(params: DWTS.Interfaces.Tables.ITableParams<T> = {}): DWTS.Interfaces.Tables.ITableParams<T> {
            let {
                //TODO: figure out a solution for disposal
                items = ko.observableArray([]).trackHasItems(),
                options = {}
            } = params;

            let {
                manageSelection = true,
                multiSelection = false,
                columns = <{ [id: string]: IColumn }>{},
                behaviours = {
                    sortable: false,
                    filterable: false
                },
                behaviourOptions = {}
            } = options;

            return {
                items,
                options: {
                    manageSelection,
                    multiSelection,
                    columns,
                    behaviours,
                    behaviourOptions
                }
            };
        }

        public init(): TableViewModel<T> {
            if (!this.isEmpty()) {
                this.setupSelection(this.dataProvider.getItems());
            }
            return this;
        }
        
        public static tableBehavioursFactory<T>(options: DWTS.Interfaces.Tables.IBaseTableOptions<T>, dataProvider: DWTS.Interfaces.Tables.ITableData<T>): { [behaviour: string]: DWTS.Interfaces.Tables.ITableBehaviourVM<T> } {
            let filterable: DWTS.Interfaces.Tables.ITableBehaviourVM<T> = null,
                sortable: DWTS.Interfaces.Tables.ITableBehaviourVM<T> = null;

            if (options.behaviours.sortable) {
                sortable = SortableTableBehaviourVM.create<T>(options.behaviourOptions.sortable, dataProvider);
            }
            if (options.behaviours.filterable) {
                filterable = FilterTableBehaviourVM.create<T>(options.behaviourOptions.filterable, sortable || dataProvider);
            }

            return {
                sortable: sortable || new BaseTableSortBehaviourVM<T>({}, dataProvider),
                filterable: filterable || new BaseTableFilterBehaviourVM<T>({}, dataProvider)
            };
        }

        private setOptions(options: DWTS.Interfaces.Tables.IBaseTableOptions<T>) {
            this.options = options;
            this.columnsCount = Object.keys(options.columns).length;
        }

        private initRows() {
            this.addDisposable(this.dataProvider.processedItemsData.subscribe((data) => {
                if (this.isLoading()) {
                    return;
                };
                this.setProcessedItems(data.items, data.options);
            }));

            this.addDisposable(this.dataProvider.items.subscribe((items) => {
                this.setLoading();
 
                this.dataProvider.setProcessedItems(items);

                this.addDisposableTask(this.update()) //needed to set the data retriever processed items
                    .then(() => {
                        return this.addDisposableTask(this.getProcessedItems());
                    })
                    .done((data) => {
                        if (this.loadingTask) {
                            this.setProcessedItems(data.items, data.options);
                            this.loadingTask.resolve();
                        }
                    })
                    .fail(() => {
                        if (this.loadingTask) this.loadingTask.resolve();
                    })
                    .always(() => {
                        this.loadingTask = null;
                    });
            }));
            let items = this.dataProvider.getItems();
            this.rows(items);
        }

        private setLoading() {
            if (this.isLoading())
                this.loadingTask.resolve();

            this.loadingTask = DW.Deferred<void>();
            this.loadingPromise = this.loadingTask.promise();
        }

        private isLoading() {
            return this.loadingTask && this.loadingTask.state() === DW.Utils.DeferredStates.pending;
        }

        public getColumnsCount(): number {
            return this.columnsCount || 10;
        }

        /* TableDataProvider */
        public getColumns(): { [id: string]: IColumn } {
            return this.options.columns;
        }
        public getItems(items?: T[]): T[] {
            return this.dataProvider.getItems();
        }
        public getItemsSilent(): T[] {
            return this.dataProvider.getItemsSilent();
        }
        public setItems(items: T[], append: boolean = false): JQueryPromise<void> {
            return this.dataProvider.setItems(items, append).then(() => {
                return this.loadingPromise || DW.Utils.resolvedDeferred;
            });
        }

        public getProcessedItems(): JQueryPromise<DWTS.Interfaces.Tables.ProcesssedItemsData<T>> {
            return this.dataProvider.getProcessedItems();
        }

        public setProcessedItems(items: T[], processedItemsOptions: DWTS.Interfaces.Tables.ProcesssedItemsOptions): void { //setRows
            this.rows(items);
            this.setupSelection(items, processedItemsOptions);
        }

        public setupSelection(items: T[], processedItemsOptions: DWTS.Interfaces.Tables.ProcesssedItemsOptions = {}): void {
            let {
                scrollToRow = false,
                setActive = false,
                keepSelection = this.hasSelection()
            } = processedItemsOptions,
                isAvailable = (items || []).indexOf(this.activeRow()) !== -1;

            if (!items.isEmpty()) {
                if (!keepSelection && this.options.manageSelection) {
                    this.selectNextAvailableRow(0, scrollToRow);
                    isAvailable = true;
                }

                else if (setActive && isAvailable) {
                    this.setActiveRow(this.activeRow(), scrollToRow);
                }
            } 

            // remove the selection if the selected row is not visible after filtering
            if (!isAvailable)
                this.setActiveRow(null, false);
        }

        /* Sortable */
        public getSortedItems(items?: T[]): JQueryPromise<T[]> {
            return this.sortBehaviour.getSortedItems(items);
        }
        public sortBy(columnName: string, sortDirection?: ISortDirection): void {
            this.sortBehaviour.sortBy(columnName, sortDirection);
        }
        public getSortableColumns(): { [id: string]: IColumn } {
            return this.sortBehaviour.getSortableColumns();
        }
        public setSelectedSortableColumns(columns: IColumn[]): void {
            this.sortBehaviour.setSelectedSortableColumns(columns);
        }
        public setSelectedSortableColumnsWithoutUpdate(columns: IColumn[]): void {
            return this.sortBehaviour.setSelectedSortableColumnsWithoutUpdate(columns);
        }
        public getSelectedSortableColumns(): IColumn[] {
            return this.sortBehaviour.getSelectedSortableColumns();
        }
        public hasSelectedSortableColumn(): boolean {
            return this.sortBehaviour.hasSelectedSortableColumn();
        }
        //TODO: remove
        public getSortTrigger(columnName: string): () => void {
            return this.sortBehaviour.getSortTrigger(columnName);
        }
        public getSortCss(property: any, provideDefaultIcon: boolean = true): string {
            return this.sortBehaviour.getSortCss(property, provideDefaultIcon);
        }

        /* Filterable */
        public getFilteredItems(items?: Array<T>): Array<T> {
            return this.filterBehaviour.getFilteredItems(items);
        }
        public clearFilter(): void {
            this.filterBehaviour.clearFilter();
        }
        public getCategoryFilters(): Array<{ key: string, displayName: string }> {
            return this.filterBehaviour.getCategoryFilters();
        }

        /* Table */
        public manageSelection(shouldManage: boolean): void {
            this.options.manageSelection = shouldManage;
        }

        public empty(): T[] {
            let res = [];
            if (!this.isEmpty()) {
                res = this.dataProvider.items.removeAll();
            }
            return res;
        }

        public addItem(item: T) {
            if (this.isEmpty()) {
                this.setItems([item]);
            } else {
                let items = this.dataProvider.getItemsSilent();
                items.push(item);
                this.setItems(items).done(() => {
                    if (this.options.manageSelection) {
                        this.setActiveRow(item, true);
                    }
                });
            }
        }

        public removeItem(item: T) {
            let lastActiveIndex = this.rows.indexOf(item),
                items = this.dataProvider.getItemsSilent();

            items.removeItem(item);
            this.setItems(items).done(() => {
                if (this.options.manageSelection) {
                    this.selectNextAvailableRow(lastActiveIndex);
                } else {
                    this.activeRow(null);
                }
            });
        }

        public clearSelection(): void {
            if (this.hasSelection()) {
                this.selectedItems.removeAll();
            }
        }

        public setSelection(row: T, isSelected: boolean): void {
            if (!isSelected) {
                var indx = this.selectedItems.indexOf(row);
                this.selectedItems.splice(indx, 1);
            } else if (this.selectedItems.indexOf(row) === -1) {
                this.selectedItems.push(row);
            }
        }

        public changeSelection(row: T, evt: MouseEvent): boolean {
            var selectRange = this.options.multiSelection && evt && evt.shiftKey
            var selectToggle = selectRange === false && this.options.multiSelection && evt && evt.ctrlKey;
            var selectSingle = selectRange === false && selectToggle === false;
            
            if (selectRange) {
                if (this.activeRow()) {
                    var dataRows = this.rows();
                    var thisIndx = dataRows.indexOf(row);
                    var prevIndx = dataRows.indexOf(this.activeRow());

                    if (thisIndx == prevIndx) {
                        return false;
                    }

                    if (thisIndx < prevIndx) {
                        thisIndx = thisIndx ^ prevIndx;
                        prevIndx = thisIndx ^ prevIndx;
                        thisIndx = thisIndx ^ prevIndx;
                    }
                    var rows = [];

                    for (; prevIndx <= thisIndx; prevIndx++) {
                        if (dataRows[prevIndx]) {
                            rows.push(dataRows[prevIndx]);
                        }
                    }

                    $.each(rows, (i, ri) => {
                        if (this.selectedItems.indexOf(ri) === -1) {
                            this.selectedItems.push(ri);
                        }
                    });

                    this.activeRow(rows[rows.length - 1]);
                    return true;
                }
            }

            if (selectSingle) {
                if (this.activeRow() === row) {
                    return true;
                }
                this.clearSelection();
            }

            // get current state
            var selectedState = this.isRowSelected(row);

            // toggle state if current mode is toggle
            this.setSelection(row, selectToggle ? !selectedState : true);

            // unset active row if current mode is toggle and current row is selected
            this.activeRow(selectToggle && selectedState ? null : row);

            return true;
        }

        public isRowSelected(row: T): boolean {
            return this.selectedItems.indexOf(row) > -1;
        }

        public setActiveRow(row: T = null, scrollToRow?: boolean): void {
            if (this.activeRow() != row) {
                this.clearSelection();
                if (row) {
                    this.setSelection(row, true);
                }
                this.activeRow(row);
            }
            this.scrollTo(row, scrollToRow);
        }

        public setActiveRowByID(findItem: (items: T[]) => T) {
            let item = findItem(this.rows());
            if (!item) return;
            this.setActiveRow(item, true);
        }

        private scrollTo(row: T, scrollToRow?: boolean) {
            if (row && scrollToRow === true) {
                this.scrollRow(row);
                //scrollRow has to be reset, because scrolling through the table afterwards snaps to the row
                this.scrollRow(null);
            }
        }

        public hasSelection() {
            return !this.selectedItems.isEmpty();
        }

        public isEmpty(): boolean {
            return this.dataProvider.isEmpty();
        }

        public selectNextAvailableRow(lastActiveRowIndex: number = 0, scrollToRow: boolean = false): void {
            var nextRow =
                this.rows()[lastActiveRowIndex] ||
                this.rows()[lastActiveRowIndex - 1] ||
                this.rows()[0];

            this.setActiveRow(nextRow, scrollToRow);
        }

        public update(): JQueryPromise<any> {
            //let updateTasks = [];

            //updateTasks.push(this.filterBehaviour.update())
            ////TODO
            ///*for (var behaviour in this.behaviours) {
            //    if (this.behaviours.hasOwnProperty(behaviour))
            //        updateTasks.push(this.behaviours[behaviour].update());
            //}*/
            //return DW.When.apply(null, updateTasks).promise();
            return this.filterBehaviour.update();
        }

        public dispose(): void {
            for (var behaviour in this.behaviours) {
                if (this.behaviours.hasOwnProperty(behaviour))
                    this.behaviours[behaviour].dispose();
            }

            this.rows = null;
            this.activeRow = null;
            super.dispose();
        }
    }

    export function createDummyTable<T>(): DWTS.Interfaces.Tables.ITable<T> {
        return {
            items: ko.observableArray<T>([]),  //TODO
            rows: ko.observableArray<T>([]),
            activeRow: ko.observable<T>(undefined),

            manageSelection: () => { },
            setItems: () => { return DW.Utils.resolvedDeferred; },
            empty: () => [],
            addItem: () => { },
            removeItem: () => { },
            clearSelection: () => { },
            setSelection: () => { },
            changeSelection: () => true,
            isRowSelected: () => false,
            setActiveRow: () => { },
            setActiveRowByID(findItem: (items: T[]) => T) { },
            isEmpty: () => true,
            selectNextAvailableRow: () => { },
            update: () => DW.When(),
            dispose: () => { },
            getItems: () => [],
            getItemsSilent: () => [],
            getProcessedItems: () => DW.Utils.resolvedDeferredWithParam<DWTS.Interfaces.Tables.ProcesssedItemsData<T>>({ items: [] }).promise(),
            setProcessedItems: () => { return DW.Utils.resolvedDeferred; },
            getSortedItems: (items?: T[]) => DW.Utils.resolvedDeferredWithParam(items).promise(),
            sortBy: () => { },
            getSortableColumns: () => { return {}; },
            setSelectedSortableColumns: () => { },
            setSelectedSortableColumnsWithoutUpdate: () => { },
            getSelectedSortableColumns: () => [new FakeColumn()],
            hasSelectedSortableColumn: () => false,
            getSortTrigger: () => () => { },
            getSortCss: () => '',
            getColumns: () => { return {}; },
            filterText: ko.observable(''),
            filterKey: ko.observable(''),
            getCategoryFilters: () => [],
            getFilteredItems(items: Array<T>): Array<T> { return items; },
            clearFilter(): void { },
            getColumnsCount: () => 10,
            type: TABLE_TYPES.simple
        }
    }

    export type TableType = 'virtual' | 'simple';

    export const TABLE_TYPES: { virtual: 'virtual', simple: 'simple' } = {
        virtual: 'virtual',
        simple: 'simple'
    }

} 