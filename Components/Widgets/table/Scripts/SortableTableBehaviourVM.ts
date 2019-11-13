namespace DWTS {


    export class SortableTableBehaviourVM<T> extends BaseTableSortBehaviourVM<T> {
        protected options: DWTS.Interfaces.Tables.ISortTableBehaviourOptions<T>;

        private selectedSortableColumns: KnockoutObservableArray<IColumn> = ko.observableArray([new FakeColumn()]);
        private isInSorting: KnockoutObservable<boolean>;
        private sortingTimeOutId: number;

        constructor(options: DWTS.Interfaces.Tables.ISortTableBehaviourOptions<T> = {}, dataProvider: DWTS.Interfaces.Tables.ITableData<T>) {
            super(options, dataProvider);
            this.init();
        }

        public static create<T>(options: DWTS.Interfaces.Tables.ISortTableBehaviourOptions<T> = {}, dataProvider: DWTS.Interfaces.Tables.ITableData<T>): SortableTableBehaviourVM<T> {
            return new SortableTableBehaviourVM<T>(this.assembleParams(options), dataProvider);
        }

        public static defaultSort(items: any[], sortBy: string, sortDir: number): JQueryPromise<any> {
            items.alphanumSort(sortDir, sortBy, true);
            return DW.Utils.resolvedDeferredWithParam(items);
        }

        public static assembleParams<T>(params: DWTS.Interfaces.Tables.ISortTableBehaviourOptions<T> = {}): DWTS.Interfaces.Tables.ISortTableBehaviourOptions<T> {
            let {
                sort = (items: any[], sortBy: string, sortDir: number): JQueryPromise<any> => this.defaultSort(items, sortBy, sortDir)
            } = params;

            return {
                sort
            };
        }

        protected init(): void {
            this.isInSorting = this.addBusyTrigger(ko.observable(false));

            this.startSortTriggerListeners();
            this.handleInitialSortiableColumnSelection();
        }

        private handleInitialSortiableColumnSelection(): void {
            if (this.hasSelectedSortableColumn()) {
                this.initSortingListeners();
            } else {
                this.startInitialSortableColumnSelectionWaiter();
            }
        }

        /**
         * Waits until sorting column is selected the first time, before starting to listen for force sort
         */
        private startInitialSortableColumnSelectionWaiter() {
            let initialSortableColumnSelectionWaiter = this.addDisposable(this.selectedSortableColumns.subscribe((columns) => {
                if (this.hasSelectedSortableColumn(columns)) {
                    this.initSortingListeners();
                    this.startSort();

                    this.removeDisposable(initialSortableColumnSelectionWaiter);
                    initialSortableColumnSelectionWaiter.dispose();
                }
            }));
        }

        private initSortingListeners(): void {
            this.addDisposable(this.selectedSortableColumns.subscribe((columns) => this.startSort()));
        }

        public getProcessedItems(items?: T[]): JQueryPromise<DWTS.Interfaces.Tables.ProcesssedItemsData<T>> {
            if (this.dataProvider.isVirtual) { //TODO
                return this.dataProvider.loadItems({
                    sortByColumn: this.getSelectedSortableColumn()
                }).then((items) => {
                    return {
                        items: items
                    }
                });
            }

            //in default case when filtered uses sortable as data retriever, dataProvider.getProcessedItems would do nothing, but still use it
            return this.dataProvider.getProcessedItems(items).done((result) => {
                return this.getSortedItems(result.items).done((sortedItems) => {
                    return { items: sortedItems, options: { 
                        setActive: true,
                        scrollToRow: true
                    }};
                });
            });       
        }

        /**
         * Wraps all the logic that should accompany a sort call
         */
        private startSort(): JQueryPromise<void> {
            this.loadingTask = DW.Deferred<void>();
            this.isInSorting(true);

            this.getProcessedItems()
                .done((data) => {
                    //in default case when filtered uses sortable as data retriever, this is sorted and filtered result
                    this.dataProvider.setProcessedItems(data.items, data.options);
                })
                .always(() => {
                    this.isInSorting(false);
                    this.loadingTask.resolve();
                });

            return this.loadingTask.promise();
        }

        /**
         *  Makes sure each sorting sets the current selected column to the appropriate one (which should trigger the sorting computed) 
         */
        private startSortTriggerListeners() {
            let columns = this.dataProvider.getColumns();
            for (let key in columns) {
                let column = columns[key];
                if (!column.sortDirection().isNone()) {
                    this.setSelectedSortableColumn(column);
                }
                this.addDisposable(column.sortDirection.subscribe((newSortDirection) => {
                    if (!newSortDirection.isNone()) {
                        this.sortByColumn(column);
                    }
                }, this));
            }
        }

        public update(): JQueryPromise<any> {
            return this.hasSelectedSortableColumn() ? this.startSort() : DW.Utils.resolvedDeferred;
        }

        private getSelectedSortableColumn(): IColumn {
            return this.selectedSortableColumns()[0];
        }

        private setSelectedSortableColumn(column: IColumn): IColumn {
            this.setSelectedSortableColumns([column]);
            return column;
        }

        public getSortedItems(items: T[] = [].concat(this.dataProvider.getItems())): JQueryPromise<T[]> {        
            if (this.hasSelectedSortableColumn()) {
                let selectedColumn = this.getSelectedSortableColumn();
                return this.options.sort(items, selectedColumn.getSortBy(), selectedColumn.getSortDirection().getValue());
            } else {
                return DW.Utils.resolvedDeferredWithParam(items);
            }
        }

        public sortBy(columnName: string, sortDirection?: ISortDirection): void {
            let newSelectedColumn = this.dataProvider.getColumns()[columnName];
            if (newSelectedColumn) {
                newSelectedColumn.setSortDirection(sortDirection);
            } else {
                //TODO: remove
                newSelectedColumn =
                    <Column>this.selectedSortableColumns().find((column) => DW.Utils.isEqual(column.getName(), columnName)) ||
                    new Column(columnName, columnName);
                if (!sortDirection) {
                    newSelectedColumn.changeSortDirection();
                } else {
                    newSelectedColumn.setSortDirection(sortDirection);
                }
            }
            this.sortByColumn(newSelectedColumn);
        }

        private sortByColumn(column: IColumn): void {
            let currentSelectedColumn = this.getSelectedSortableColumn();
            if (DW.Utils.isEqual(currentSelectedColumn.getName(), column.getName())) {
                this.selectedSortableColumns.valueHasMutated();
            } else {
                this.disableColumnSorting(currentSelectedColumn);
                this.setSelectedSortableColumn(column);
            }
        }

        private disableColumnSorting(column: IColumn = this.getSelectedSortableColumn()): void {
            column.setSortDirection(SortDirection.SORT_DIRECTIONS.none);
        }

        public hasSelectedSortableColumn(columns: IColumn[] = this.getSelectedSortableColumns()): boolean {
            return !!columns[0].getName();
        }

        //TODO: remove
        public getSortTrigger(columnName: string): () => void {
            return () => {
                this.sortBy(columnName, null);
            };
        }

        public getSortableColumns(): { [id: string]: IColumn } {
            let columns = this.dataProvider.getColumns(),
                sortableColumns: { [id: string]: IColumn } = {},
                column;
            for (let key in columns) {
                column = columns[key];
                if (column.getSortBy()) {
                    sortableColumns[key] = column;
                }
            }
            return sortableColumns;
        }

        public setSelectedSortableColumns(columns: IColumn[]): void {
            this.selectedSortableColumns(columns);
        }

        public setSelectedSortableColumnsWithoutUpdate(columns: IColumn[]): void {
            columns.forEach((column, index) => this.selectedSortableColumns()[index] = column);
        }

        public getSelectedSortableColumns(): IColumn[] {
            return this.selectedSortableColumns();
        }

        //TODO: remove
        public getSortCss(property: any, provideDefaultIcon: boolean = true): string {
            if (DW.Utils.isEqual(property, this.getSelectedSortableColumn().getName())) {
                return this.getSelectedSortableColumn().getCss();
            } else {
                return SortDirection.SORT_DIRECTIONS.none.getCss();
            }
        }

        public dispose(): void {
            if (this.sortingTimeOutId) clearTimeout(this.sortingTimeOutId);
            super.dispose();
        }
    }

} 