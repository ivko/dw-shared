namespace DWTS {

    export interface ITrackable<T> {
        hasChanges: KnockoutObservable<boolean>;
        register(item: T): void;
        get(): T;
        getOriginal(): T;
        set(val: T): void;
        create(item: T): void;
        update(item: T): void;
        sync(synchronizer: ISynchronizer<T>, preserveState?: boolean): JQueryPromise<any>;
        getOriginal(): T;
        clear(): void;
    }

    export interface IPublicTrackable<T> {
        get(): T;
        update(item: T): void;
        register(item: T): void;
        create(item: T): void;
        hasChanges: KnockoutObservable<boolean>;
        clear(): void;
    }
  

    export class Trackable<T> extends Disposable implements ITrackable<T> {

        private crud: CrudMap<T> = null;

        public hasChanges: KnockoutObservable<boolean>;


        constructor(private fnIdentity: (obj: T) => any = null,
            item: T = null,
            private fnCompare: (objToCompare: T, objToCompareWith: T) => boolean = DW.Utils.isEqual,
            private fnClone: (objectToClone: T) => T = Object.clone) {
            super();

            this.crud = this.addDisposable(new CrudMap<T>(
                this.fnIdentity,
                this.fnCompare,
                this.fnClone
            ));

            this.register(item);

            this.hasChanges = this.crud.hasChanges;
        }

        public subscribeForChange(subscription: () => void): ICrudChangedSubscription {
            return this.crud.subscribeForChange(subscription);
        }

        public isRegistered(): boolean {
            return !this.crud.notRegistered;
        }

        public register(item: T): void {
            if (!item) return;
            this.crud.registerOne(item);
        }

        public get(): T {
            return this.crud.getFirstItem();
        }

        public getOriginal(): T {
            let item = this.get();
            return this.crud.getOriginal(item);
        }

        public set(val: T): void {
            this.crud.reset([val]);
        }

        public create(item: T): void {
            this.crud.create(item);
        }

        public update(item: T) {
            return this.crud.update(item);
        }

        public updateOriginal(item: T): void {
            this.crud.updateOriginal(item);
        }

        public clear(): void {
            this.crud.clear();
        }

        public sync(synchronizer: ISynchronizer<T>, preserveState: boolean = false): JQueryPromise<any> {
            return this.crud.sync(synchronizer, preserveState);
        }
    }
}