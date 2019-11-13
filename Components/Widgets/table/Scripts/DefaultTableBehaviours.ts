namespace DWTS {
    export class DefaultTableBehaviourVM<T> extends DWTS.BusyTriggerVM implements DWTS.Interfaces.Tables.ITableBehaviourVM<T>, DWTS.Interfaces.Tables.ITableData<T>{
        protected loadingTask: JQueryDeferred<void>;
        constructor(protected options: DWTS.Interfaces.Tables.IBaseTableAdapterOptions<T> = {}, public dataProvider: DWTS.Interfaces.Tables.ITableData<T>) {
            super();
        }
        public static create<T>(options: DWTS.Interfaces.Tables.IBaseTableAdapterOptions<T> = {}, dataProvider: DWTS.Interfaces.Tables.ITableData<T>): DefaultTableBehaviourVM<T> {
            return new DefaultTableBehaviourVM<T>(options, dataProvider);
        }
        public getColumns(): { [id: string]: IColumn } {
            return this.dataProvider.getColumns();
        }
        public setProcessedItems(items: T[], processedItemsOptions?: DWTS.Interfaces.Tables.ProcesssedItemsOptions): void {
            this.dataProvider.setProcessedItems(items, processedItemsOptions);
        }
        public getProcessedItems(items: T[]): JQueryPromise<DWTS.Interfaces.Tables.ProcesssedItemsData<T>> {
            return this.dataProvider.getProcessedItems(items);
        }
        public getItems(items: T[] = []): T[] {
            return this.dataProvider.getItems(items);
        }
        public getItemsSilent(items: T[] = []): T[] {
            return this.dataProvider.getItemsSilent();
        }
        public setItems(items): JQueryPromise<void> {
            return this.dataProvider.setItems(items);
        }
        public update(): JQueryPromise<any> {
            return DW.Utils.resolvedDeferred;
        }
    }

    export class BaseTableSortBehaviourVM<T> extends DefaultTableBehaviourVM<T> implements DWTS.Interfaces.Tables.IDefaultTableSortBehaviourVM<T> {
        constructor(options: DWTS.Interfaces.Tables.ISortTableBehaviourOptions<T> = {}, dataProvider: DWTS.Interfaces.Tables.ITableData<T>) {
            super(options, dataProvider);
        }
        public update(): JQueryPromise<any> {
            return DW.Utils.resolvedDeferred;
        }
        public getSortedItems(items: T[] = []): JQueryPromise<T[]> {
            return DW.Utils.resolvedDeferredWithParam(items);
        }
        public sortBy(columnName: string, sortDirection?: ISortDirection): void { }
        public getSortableColumns(): { [id: string]: IColumn } {
            return {};
        }
        public setSelectedSortableColumns(columns: IColumn[]): void { }
        public setSelectedSortableColumnsWithoutUpdate(columns: IColumn[]): void { }
        public getSelectedSortableColumns(): IColumn[] {
            return [];
        }
        public hasSelectedSortableColumn(): boolean {
            return false;
        }
        public getSortTrigger(columnName: string, columns?: { [id: string]: IColumn }): () => void {
            return () => { };
        }
        public getSortCss(property: any, provideDefaultIcon: boolean = true): string {
            return '';
        }

    }

    export class BaseTableFilterBehaviourVM<T> extends DefaultTableBehaviourVM<T> implements DWTS.Interfaces.Tables.IDefaultTableFilterBehaviourVM<T>{
        constructor(options: DWTS.Interfaces.Tables.IFilterTableBehaviourOptions<T> = {}, dataProvider?: DWTS.Interfaces.Tables.ITableData<T>) {
            super(options, dataProvider);
        }
        public filterText: KnockoutObservable<any> = ko.observable('');
        public filterKey: KnockoutObservable<string> = ko.observable('');         
        public filterExternalFn: KnockoutObservable<(value: T, index: number, array: T[]) => boolean> = ko.observable(() => { return true; });
        public getFilteredItems(items: Array<T> = []): Array<T> {
            return items;
        }
        public getCategoryFilters(): Array<{ key: string, displayName: string }> {
            return [];
        }
        public clearFilter(): void { }
    }

}