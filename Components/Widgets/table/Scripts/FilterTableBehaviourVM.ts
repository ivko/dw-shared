namespace DWTS {

    export class FilterTableBehaviourVM<T> extends BaseTableFilterBehaviourVM<T> {
        protected options: DWTS.Interfaces.Tables.IFilterTableBehaviourOptions<T>;
        public filterExternalFn: KnockoutObservable<(value: T, index: number, array: T[]) => boolean>;
        private categories: Array<{ key: string, displayName: string }> = [];
        private isInFiltering: KnockoutObservable<boolean>;

        constructor(options: DWTS.Interfaces.Tables.IFilterTableBehaviourOptions<T> = {}, dataProvider: DWTS.Interfaces.Tables.ITableData<T>) {
            super(options, dataProvider);
            this.init();
        }

        public static create<T>(params: DWTS.Interfaces.Tables.IFilterTableBehaviourOptions<T>, dataProvider: DWTS.Interfaces.Tables.ITableData<T>): FilterTableBehaviourVM<T> {
            return new FilterTableBehaviourVM<T>(this.assembleParams(params), dataProvider);
        }

        public static assembleParams<T>(params: DWTS.Interfaces.Tables.IFilterTableBehaviourOptions<T> = {}): DWTS.Interfaces.Tables.IFilterTableBehaviourOptions<T> {
            let {
                filterProperty = 'name',
                filterText = '',
                filterKey = 'all',
                categoryFilters = []
            } = params;

            return {
                filterProperty,
                filterText,
                filterKey,
                categoryFilters
            };
        }

        public getProcessedItems(items: T[] = [].concat(this.dataProvider.getItems())): JQueryPromise<DWTS.Interfaces.Tables.ProcesssedItemsData<T>> {
            if (this.dataProvider.isVirtual) {
                return this.dataProvider.loadItems({
                    filter: {
                        filterText: this.filterText()
                    }
                }).then((items) => {
                    return {
                        items: items
                    }
                });
            }
            let filteredItems = this.getFilteredItems(items);

            return this.dataProvider.getProcessedItems(filteredItems);
        }
       
        protected init() {
            this.isInFiltering = this.addBusyTrigger(ko.observable(false));
            this.filterText(this.options.filterText);
            this.filterKey(this.options.filterKey);

            let categoryFilters: { [key: string]: (item: T) => boolean } = {};

            this.categories = this.options.categoryFilters.map((data) => {
                categoryFilters[data.key] = data.filter;
                return {
                    key: data.key,
                    displayName: data.displayName
                };
            });

            this.addDisposable(this.filterKey.subscribe((key) => {
                this.filterExternalFn(categoryFilters[key] || null);
            }));

            var startFilteringComputed = this.addDisposable(
                this.addDisposable(ko.computed(() => {
                    this.filterExternalFn();
                    this.filterText();
                })).extend({ rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' }, notify: 'always' }));

            this.addDisposable(startFilteringComputed.subscribe(() => this.startFilter()));
        }

        public getCategoryFilters(): Array<{ key: string, displayName: string }> {
            return this.categories;
        }

        private startFilter(): JQueryPromise<void> {
            this.loadingTask = DW.Deferred<void>();
            this.isInFiltering(true);

            //here we should always start with the whole set of items and filter them. 
            //for example we are clearing the filter and the currently proccessed items are less than the whole set of unfiltered items
            this.getProcessedItems()
                .done((data) => {
                    this.dataProvider.setProcessedItems(data.items, data.options);
                })
                .always(() => {
                    this.loadingTask.resolve();
                    this.isInFiltering(false);
                });

            return this.loadingTask.promise();
        }

        public clearFilter(): void {
            //used to clear the search input on ESC key
            this.filterText("");
        }

        public getFilteredItems(items: Array<T> = this.dataProvider.getItems()): Array<T> {
            var filter = this.filterText(),
                filterProperty = this.options.filterProperty,
                filterBy = (filterProperty || null) && ($.isFunction(filterProperty) ? filterProperty : (item) => {
                    return ko.unwrap(item[filterProperty]);
                }),
                filterFn = this.filterExternalFn();

            //clean the text so that it can be used as pure string in the RegEx
            var query = filter.replace(/[\\.\+\*\?\^\$\[\]\(\)\{\}\/'\#\:\!\=\|]/ig, '\\$&');
            var regex = query.split(' ').filter((q) => {
                return q;
            }).map((q) => {
                return new RegExp(q, 'i');
            });

            if (filterBy && regex.length) {
                items = items.filter((item) => {
                    var match = true;
                    regex.forEach((r) => {
                        match = match && r.test(filterBy(item));
                    });
                    return match;
                });
            }
            if (filterFn) {
                items = items.filter(filterFn);
            }

            return items;
        }

        public update(): JQueryPromise<any> {
            return this.isInFiltering() ? DW.Utils.resolvedDeferred : this.startFilter();
        }
    }
}
