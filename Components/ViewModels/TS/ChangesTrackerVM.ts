namespace DWTS {
    export class ChangesTrackerVM extends DWTS.Disposable {

        private changesTriggers: KnockoutObservableArray<any>;
        public hasChanges: KnockoutObservable<boolean> = ko.observable(false);

        constructor() {
            super();

            this.changesTriggers = this.addDisposable(ko.observableArray());
            this.addDisposable(this.addDisposable(ko.computed(() => {
                this.hasChanges.peek();
                this.hasChanges(this.changesTriggers().some((trigger) => {
                    return (jQuery.isFunction(trigger) ? trigger() : trigger);
                }));
            })).extend({ deferred: true }));
        }

        public addChangeTrigger<T extends KnockoutObservable<U>, U>(trigger: KnockoutObservable<U>): KnockoutObservable<U> {
            this.changesTriggers.push(trigger);
            return trigger;
        }

        public addChangeTriggers<T extends KnockoutObservable<U>, U>(triggers: KnockoutObservable<U>[]): void {
            this.changesTriggers.push.apply(this.changesTriggers, triggers);
        }

        public removeChangeTriggers<T extends KnockoutObservable<U>, U>(trigger: KnockoutObservable<U>): void {
            this.changesTriggers.remove(trigger);
        }

        public clearChangeTriggers(): void {
            this.changesTriggers.removeAll();
        }
    }
}