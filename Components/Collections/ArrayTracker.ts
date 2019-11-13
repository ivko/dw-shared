namespace DWTS {
    export class ArrayTracker<T> extends DWTS.Disposable {
        private originalList: Array<T> = [];
        public hasChanges: KnockoutObservable<boolean> = ko.observable(false);

        constructor(private list: Array<T> = []) {
            super();
            this.setOriginal(list);
        }

        public clear(): void {
            this.setOriginal([]);
        }

        public setOriginal(list: Array<T>): void {
            this.originalList = list;
            this.list = [].concat(list);
            this.hasChanges(false);
        }

        public getOriginal(): Array<T> {
            return this.originalList;
        }

        public get(): Array<T> {
            return this.list;
        }

        public update(list: Array<T>) {

            this.list = list;
            let arrangedList = DW.Utils.getArrangedArray<T>(this.originalList, this.list)

            this.hasChanges(!DW.Utils.isEqual(this.originalList, arrangedList));
        }
    }
}