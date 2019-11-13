namespace PagesContainerComponent {

    export interface IPage extends DWTS.IBusyTrigger {
        active: KnockoutObservable<boolean>;
        ready: KnockoutObservable<boolean>;
        uniqueID: string;
        canActivate(): boolean;
        getTemplate(): string;
        getType(): string;
        getTitle(): string;
        validate(): ValidationResult;
        getWarnings(): ValidationResult;
        show(): JQueryPromise<void>;
        navigateAway(nextPage: IPage): JQueryPromise<void>;
        navigateTo(nextPage: IPage): void;
        hide(): void;
    }

    export class ValidationResult {
        public isValid;
        constructor(public messages: Array<string> = []) {
            this.isValid = messages.length < 1;
        }
    }

    export abstract class SettingsPageVM extends DWTS.BusyTriggerVM implements IPage {
        public uniqueID: string;
        public active: KnockoutObservable<boolean> = ko.observable(false);
        public ready: KnockoutObservable<boolean> = ko.observable(false);

        private init: () => JQueryPromise<void>;

        constructor() {
            super();
            this.uniqueID = DW.Utils.uniqueId();

            this.addDisposable(this.active.subscribe((val) => this.onActivate(val)));

            //sealed
            this.init = DW.Utils.lazyDeferredForPromises(() => {
                this.ready(false);
                let error: DWTS.Error = null;
                return this.addBusyPromise(this.initInternal())
                    .then(null, (err) => {
                        error = err;
                        DW.Utils.handleError(error)
                        return DW.Utils.rejectedDeferredWithParam(error);
                    })
                    .always(() => {
                        //start track changes
                        this.ready(true);
                        if (error && error.canceled) return;/*disposed while initializing*/
                        this.addDisposable(this.addDisposable(ko.computed(() => this.flushChanges())).extend({ deferred: true }));
                    });
            });
        }

        public abstract getTemplate(): string;
        public abstract getType(): string;
        public abstract getTitle(): string;

        //virtual
        protected flushChanges(): void {
        }

        //virtual
        protected onActivate(isActive: boolean): void {
        }

        //virtual
        public canActivate(): boolean {
            return !this.active();
        }
        //virtual
        protected initInternal(): JQueryPromise<any> {
            return DW.Utils.resolvedDeferred;
        }

        //sealed/final
        public validate(): ValidationResult {
            if (!this.ready()) return new ValidationResult();
            return this.validateInternal();
        }

        //virtual
        protected validateInternal(): ValidationResult {
            return new ValidationResult();
        }

        //sealed/final
        public getWarnings(): ValidationResult {
            if (!this.ready()) return new ValidationResult();
            return this.getWarningsInternal();
        }

        //virtual
        protected getWarningsInternal(): ValidationResult {
            return new ValidationResult();
        }

        public show(): JQueryPromise<void> {
            this.active(true);

            return this.init();
        }

        public hide(): void {
            this.active(false);
        }

        public navigateAway(nextPage: IPage): JQueryPromise<void> {
            return DW.Deferred<void>((dfd) => dfd.resolve()).promise();
        }

        public navigateTo(nextPage: IPage): void { }
    }

}