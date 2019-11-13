namespace DWTS {
    export interface IBusyTrigger extends DWTS.IDisposable {
        isBusy: KnockoutObservable<boolean>;
        addBusyTrigger(trigger: any): any;
        removeBusyTrigger(trigger: any): any;
        addBusyPromise<T>(promise: JQueryPromise<T>): JQueryPromise<T>;
    }

    export class BusyTriggerVM extends DWTS.ViewModel implements IBusyTrigger {
        public isBusy: KnockoutObservable<boolean>;
        private _triggers: KnockoutObservableArray<any>;

        constructor(options?: Object) {
            super();
            this._triggers = ko.observableArray();
            this.isBusy = ko.computed(() => {
                return this._triggers().some(function (trigger) {
                    return ($.isFunction(trigger) ? trigger() : trigger);
                });
            });
        }

        public addBusyTrigger(trigger: any): any {
            this._triggers.push(trigger);
            return trigger;
        }

        public removeBusyTrigger(trigger: any): any {
            this._triggers.remove(trigger);
            return trigger;
        }

        public addBusyPromise<T>(promise: JQueryPromise<T>): JQueryPromise<T> {
            let promiseTrigger = this.addBusyTrigger(ko.observable(true));
            promise.always(() => this.removeBusyTrigger(promiseTrigger));
            return promise;
        }

        public removeAllTriggers(): void {
            this._triggers.removeAll();
        }

        public dispose(): void {
            DisposableApi.dispose(this.isBusy);       // stop listen
            DisposableApi.dispose(this._triggers());
            this._triggers.removeAll();                  // clear array
            super.dispose();
        }
    }

    export function createDummyBusyTrigger<T>(): IBusyTrigger {
        return {
            isBusy: ko.observable(false),
            addBusyTrigger: (trigger: any) => trigger,
            removeBusyTrigger: (trigger: any) => trigger,
            addBusyPromise: <T>(promise: JQueryPromise<T>) => promise,
            addDisposable: <T>(disposable: T) => disposable,
            removeDisposable: <T>(disposable: T) => disposable,
            addDisposableTask: <T>(task: JQueryPromise<T>) => task,
            dispose: () => { }
        };
    }

}