namespace DWTS {
    export var DefaultTableRangeValues = {
        start: 0,
        end: 100
    }

    export class DefaultTableRange extends Range {
        constructor() {
            super(DefaultTableRangeValues.start, DefaultTableRangeValues.end);
        }
    }

    export class TableDataProviderQuery implements DWTS.Interfaces.Tables.ITableDataProviderQuery {
        constructor(
            public range: IRange = new DefaultTableRange(),
            public sortByColumn: DWTS.IColumn = null,
            public filter: DWTS.Interfaces.Tables.ITableFilterQuery = {}) {
        }
        public setConditions(range: IRange = new DefaultTableRange(),
            sortByColumn: DWTS.IColumn = this.sortByColumn,
            filter: DWTS.Interfaces.Tables.ITableFilterQuery = this.filter) {

            this.range = range;
            this.sortByColumn = sortByColumn;
            this.filter = filter;
        }
    }

    export class VirtualTableDataProvider<T> extends TableDataProvider<T> implements DWTS.Interfaces.Tables.ITableDataProvider<T>{
        private query: TableDataProviderQuery;
        private count: KnockoutObservable<number> = ko.observable(DefaultTableRangeValues.end);
        private totalCount: number = 0;

        constructor(columns: { [id: string]: IColumn } = {},
            items: KnockoutObservableArray<T> = ko.observableArray<T>([]),
            private loadItemsProvider: (query: DWTS.Interfaces.Tables.ITableDataProviderQuery) => JQueryPromise<DWTS.Interfaces.Tables.ITableDataProviderResult<T>>) {

            super(columns, items);

            this.finalCountFound = false;
            this.isVirtual = true;
            this.query = new TableDataProviderQuery();
        }

        public loadItems(query: DWTS.Interfaces.Tables.ITableDataProviderQuery): JQueryPromise<T[]> {
            if (query.filter) {
                this.resetCount();
            }
            this.query.setConditions(query.range, query.sortByColumn, query.filter);

            return this.loadItemsProvider(this.query).then((data: DWTS.Interfaces.Tables.ITableDataProviderResult<T>) => {
                if (this.finalCountFound) {
                    //reset this only for unknown data, which might have more data after the limit was once reached.
                    //meanwhile on the server there might be more data, e.g. in case of audint the data might come all the time
                    if (data.count === -1) {
                        this.finalCountFound = false;
                    }
                    return data.items;
                }

                let wantedCount = this.query.range.getCount();

                if (data.count === -1) {
                    if (this.query.range.getEnd() >= this.totalCount && data.items.length >= wantedCount) {
                        this.finalCountFound = false;
                        this.totalCount = this.query.range.getEnd();
                        this.count(this.totalCount + wantedCount);
                    }                 

                    if (data.items.length < wantedCount) {
                        if (data.items.isEmpty() && this.totalCount < this.query.range.getStart()) {
                            return this.loadItems(
                                new TableDataProviderQuery(
                                    new Range(this.totalCount, this.query.range.getStart()),
                                    query.sortByColumn,
                                    query.filter || null));
                        }
                        this.finalCountFound = true;
                        this.totalCount = this.query.range.getEnd() - (wantedCount - data.items.length);

                        this.count(this.totalCount);
                    }
                }
                else {
                    this.finalCountFound = true;
                    this.count(data.count);
                }

                return data.items;
            });
        }

        public getCount(): number {
            return this.count();
        }

        private resetCount(): void {
            this.totalCount = 0;
            this.finalCountFound = false;
        }

        public reset(): void {
            this.resetCount();
            this.count(DefaultTableRangeValues.end);
            this.query = new TableDataProviderQuery();
        }

        public getItems(items?: T[]): T[] {
            return this.processedItemsData().items;
        }

        public getItemsSilent(): T[] {
            return this.processedItemsData.peek().items;
        }

        public setItems(items: T[]): JQueryPromise<void> {
            let setItemsTask = DW.Deferred<void>();
            this.setProcessedItems(items); //TODO: sync with processedItems length
            return setItemsTask.promise();
        }

        public isEmpty(): boolean {
            return false;
        }
    }
}