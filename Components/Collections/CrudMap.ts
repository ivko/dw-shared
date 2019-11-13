namespace DWTS {

    export interface ISynchronizer<T> {
        create: (item: T) => any;
        update: (item: T) => any;
        delete: (item: T) => any;
    }


    /**
    * Crud item state
    */
    export enum CrudItemState {
        None,
        Created,
        Deleted,
        Updated
    }
    
    export interface ICrudChangedSubscription {
        dispose();
    }
    export class NullCrudChangedSubscription implements ICrudChangedSubscription {
        dispose() {

        }
    }

    export class CrudMap<T> extends Disposable {
        //used to show if the Crud is still empty and no items were 
        //created or registered
        public notRegistered: boolean = true;

        public hasChanges: KnockoutObservable<boolean> = ko.observable(false);

        private subscriptions: Array<(item: T, state: CrudItemState) => void> = [];

        protected originals: { [id: string]: T; } = {};
        protected created: { [id: string]: T; } = {};
        protected updated: { [id: string]: T; } = {};
        protected deleted: { [id: string]: T; } = {};

        /**
         * @param fnIdentity returns the identity value for a given object (former keyfn)
         * @param fnCompare compares the object content (former isEqualFn)
         */
        constructor(protected fnIdentity: (obj: T) => any = null,
            private fnCompare: (objToCompare: T, objToCompareWith: T) => boolean = DW.Utils.isEqual,
            private fnClone: (objectToClone: T) => T = Object.clone) {
            super();

            if (!(fnIdentity && $.isFunction(fnIdentity))) throw new Error('KeyFunctionNotDefined');

            this.reset(null);
        }

        public reset(items: T[]): void {
            this.clear();
            this.register(items, true);
        }

        public clear(): void {
            this.originals = {};
            this.created = {};
            this.updated = {};
            this.deleted = {};
            this.notRegistered = true;
            this.notifyChanges();
        }

        protected notifyChanges(item: T = null, state: CrudItemState = CrudItemState.None): void {
            this.updateHasChanges();

            this.subscriptions.forEach((subscription) => {
                subscription(item, state);
            });
        }

        public subscribeForChange(callback: (item: T, state: CrudItemState) => void): ICrudChangedSubscription {
            this.subscriptions.push(callback);
            return {
                dispose: () => {
                    this.subscriptions.splice(this.subscriptions.indexOf(callback), 1);
                }
            }
        }

        protected updateHasChanges(): boolean {
            var hasChanges = !!(Object.keys(this.created).length || Object.keys(this.updated).length || Object.keys(this.deleted).length);
            this.hasChanges(hasChanges);
            return hasChanges;
        }

        public registerOne(item: T, allowUpdate: boolean = true): void {
            this.register([item], allowUpdate);
        }

        public register(items: T[], allowUpdate: boolean = true): void {
            let self = this;
            if (items) {
                items.forEach((function (item) {
                    var key = self.fnIdentity(item);
                    if (self.originals[key]) { // already registered
                        if (!allowUpdate) throw new Error('AlreadyRegistered');
                        if (self.updated[key]) { // update and preserve changes
                            //check if there are still changes => if not delete it from updates
                            self.updated[key] = (<any>Object).merge(this.fnClone(item), self.updated[key]);
                        }
                    }
                    this.originals[key] = this.fnClone(item);
                }).bind(self));
                this.notRegistered = false;
            }
        }

        public getOriginal(item: T): T {
            if (!item) return;
            var key = this.fnIdentity(item),
                obj = this.originals[key] || this.created[key];
            return obj ? this.fnClone(obj) : null;
        }

        public updateOriginal(item: T): void {
            if (!item) return;
            var key = this.fnIdentity(item);
            this.originals[key] = this.fnClone(item);
            if (this.updated[key] && this.fnCompare(this.originals[key], this.updated[key])) {
                //no changes then
                delete this.updated[key];
                this.notifyChanges(item, CrudItemState.Updated);
            }
        }

        public getItems(filter): T[] {
            var items = (<any>Object).append({}, this.originals, this.updated, this.created);
            if (filter && $.isFunction(filter)) {
                items = (<any>Object).filter(items, filter);
            }
            items = (<any>Object).map(items, this.fnClone);

            return (<any>Object).values(items);
        }

        public getFirstItem(): T {
            var result: T[] = this.getItems(null);
            if (!result || result.length <= 0) { return null; }

            return result[0];
        }

        public getByType(types): T[] {
            var items = {};
            types.forEach(function (type) {
                items = (<any>Object).append(items, this[type]);
            }.bind(this));

            return (<any>Object).values((<any>Object).map(items, this.fnClone));
        }

        public create(item: T): void { // full item
            this.notRegistered = false;
            var key = this.fnIdentity(item);
            if (this.created[key]) throw new Error("AlreadyCreated");
            if (this.originals[key] || this.updated[key]) throw new Error('AlreadyRegistered');
            if (this.deleted[key]) throw new Error('AlreadyDeleted');
            this.created[key] = this.fnClone(item);
            this.notifyChanges(item, CrudItemState.Created);
        }

        public read(item: T): T { // item prototype
            var key = this.fnIdentity(item);
            if (this.deleted[key]) throw new Error('AlreadyDeleted');
            var found = this.created[key] || this.updated[key] || this.originals[key];
            return found ? this.fnClone(found) : null;
        }

        public update(item: T): void { // full item
            var key = this.fnIdentity(item);
            if (this.created[key]) {
                this.created[key] = this.fnClone(item);
            } else {
                if (this.deleted[key]) throw new Error('AlreadyDeleted');
                if (!this.originals[key]) throw new Error('NotRegistered');

                if (this.fnCompare(this.originals[key], item)) {
                    delete this.updated[key];
                } else {
                    this.updated[key] = this.fnClone(item);
                }
            }
            this.notifyChanges(item, CrudItemState.Updated);
        }

        public delete(item: T): void { // item prototype or full item
            var key = this.fnIdentity(item);
            if (this.created[key]) {
                delete this.created[key];
            } else if (this.updated[key]) {
                delete this.updated[key];
                delete this.originals[key];
                this.deleted[key] = this.fnClone(item);
            } else {
                delete this.originals[key];
                this.deleted[key] = this.fnClone(item);
            }
            this.notifyChanges(item, CrudItemState.Deleted);
        }

        public dispose(): void {
            this.clear();
            this.subscriptions = null;
        }

        protected getSyncActions(synchronizer: ISynchronizer<T>, preserveState: boolean = false): Array<Function> {
            return [].concat(
                Object.keys(this.deleted).map((function (key) {
                    return () => {
                        return DW.When<any>(synchronizer.delete(this.deleted[key])).done(() => {
                            if (preserveState) {
                                delete this.deleted[key];
                            }
                        });
                    }
                }).bind(this)),
                Object.keys(this.updated).map((function (key) {
                    return () => {
                        return DW.When<any>(synchronizer.update.call(this, this.updated[key])).done(() => {
                            if (preserveState) {
                                this.originals[key] = this.fnClone(this.updated[key]);
                                delete this.updated[key];
                            }
                        });
                    }
                }).bind(this)),
                Object.keys(this.created).map((function (key) {
                    return () => {
                        return DW.When<any>(synchronizer.create.call(this, this.created[key])).done(() => {
                            if (preserveState) {
                                this.originals[key] = this.fnClone(this.created[key]);
                                delete this.created[key];
                            }
                        });
                    }

                }).bind(this))
            );
        }

        public sync(synchronizer: ISynchronizer<T>, preserveState: boolean = false): JQueryPromise<any> { // returns promise
            var actions = this.getSyncActions(synchronizer, preserveState);

            return CrudMap.execSequentially.apply(this, actions).always((function () {
                if (!preserveState) {
                    this.clear();
                }
                else
                    this.updateHasChanges();
                return true;
            }).bind(this));
        }

        private static execSequentially(first /* rest... */) {
            var self = this;
            if (arguments.length === 0) {
                return DW.When();
            } else if (arguments.length === 1) {
                return DW.When(first.call(self));
            } else {
                var rest = [].slice.call(arguments, 1);
                return CrudMap.execSequentially.call(self, first).then(function () {
                    return CrudMap.execSequentially.apply(self, rest);
                });
            }
        }
    }
}