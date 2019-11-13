namespace DWTS {

    export class TableDataProvider<T> extends DWTS.ViewModel implements DWTS.Interfaces.Tables.ITableDataProvider<T>{
        public finalCountFound: boolean = true;
        public isVirtual: boolean = false;
        public processedItemsData: KnockoutObservable<DWTS.Interfaces.Tables.ProcesssedItemsData<T>> = ko.observable(null);

        constructor(public columns: { [id: string]: IColumn } = {},
            public items: KnockoutObservableArray<T> = ko.observableArray<T>([])) {

            super();
            //items.extend({ deferred: true });

            this.processedItemsData({
                items: items(),
                options: this.getDefaultProcessedItemsOptions()
            });
        }

        public getColumns(): { [id: string]: IColumn } {
            return this.columns;
        }
        public getProcessedItems(items?: T[]): JQueryPromise<DWTS.Interfaces.Tables.ProcesssedItemsData<T>> {
            return DW.Utils.resolvedDeferredWithParam(items ? { items: items } : this.processedItemsData());
        }
        public setProcessedItems(items: T[] = [], processedItemsOptions?: DWTS.Interfaces.Tables.ProcesssedItemsOptions): void {
            this.processedItemsData({
                items: items,
                options: $.extend(this.getDefaultProcessedItemsOptions(), processedItemsOptions)
            });
        }
        public getItems(items?: T[]): T[] {
            return this.items();
        }
        public getItemsSilent(): T[] {
            return this.items.peek();
        }
        public setItems(items: T[], append: boolean = false): JQueryPromise<void>  {
            this.items(append ? this.items().concat(items) : items);
            return DW.Utils.resolvedDeferred;
        }
        public isEmpty(): boolean {
            return this.items.isEmpty();
        }

        private getDefaultProcessedItemsOptions(): DWTS.Interfaces.Tables.ProcesssedItemsOptions {
            return {
                scrollToRow: false,
                setActive: false,
            };
        }

        public loadItems(query: DWTS.Interfaces.Tables.ITableDataProviderQuery): JQueryPromise<T[]> {
            let processedItemsData = this.processedItemsData.peek(),
                items = processedItemsData.items.slice(query.range.getStart(), query.range.getEnd());
            return DW.Utils.resolvedDeferredWithParam(items);
        }

        public getCount(): number {
            return this.processedItemsData().items.length;
        }

        public reset(): void {            
        }

    }
}