namespace DWTS.MoreOptionsComponent {
    let localizationResources = (<any>window).DWResources.MoreOptions;
    //TODO: extract this logic in Utils and reuse it on all places, where it is copy-pasted
    export function localize(key: string, params?: any) {
        return DW.Utils.format((localizationResources && localizationResources[key]) || key || '', params);
    }

    export type Labels = {
        show: string;
        hide: string;
    }

    export type MoreOptionsVMParams<T> = {
        templateName: string;
        vm?: T;
        labels?: Labels;
        canChangeCustomTemplateVisibility?: () => boolean;
        shouldShowCustomTemplate?: KnockoutObservable<boolean>;
    }

    export class MoreOptionsVM<T> extends DWTS.Disposable {
        private labels: Labels;

        private _shouldShowCustomTemplate: KnockoutObservable<boolean>;
        public get shouldShowCustomTemplate(): boolean {
            return this._shouldShowCustomTemplate();
        }
        private setShouldShowCustomTemplate = (shouldShowCustomTemplate: boolean) => {
            this._shouldShowCustomTemplate(shouldShowCustomTemplate);
        }

        private _shouldScrollIntoView: KnockoutObservable<boolean> = ko.observable(false);
        public get shouldScrollIntoView(): boolean {
            return this._shouldScrollIntoView();
        }

        private _label: KnockoutObservable<string>;
        public get label(): string {
            return this._label();
        }

        private _templateName: string;
        public get templateName(): string {
            return this._templateName;
        }

        private _vm: T;
        public get vm(): T {
            return this._vm;
        }

        private _customTemplateVisibilityChangeCommand: DW.Command; 
        public get customTemplateVisibilityChangeCommand(): DW.Command {
            return this._customTemplateVisibilityChangeCommand;
        }

        public afterCustomTemplateRendering() {
            this._shouldScrollIntoView(true);

            this.setShouldShowCustomTemplate = DW.Utils.extendMethod.call(
                this,
                this.setShouldShowCustomTemplate,
                (result: void, shouldShowCustomTemplate: boolean) => {
                    if (shouldShowCustomTemplate) {
                        this._shouldScrollIntoView(true);
                    }
                });
        }

        private onCustomTemplateVisibilityChange(isVisible: boolean) {
            if (isVisible) {
                this._label(this.labels.hide);
            } else {
                this._shouldScrollIntoView(false);
                this._label(this.labels.show)
            }
        }

        private initShouldShowCustomTemplate(shouldShowCustomTemplate?: KnockoutObservable<boolean>) {
            if (shouldShowCustomTemplate === void 0) {
                this._shouldShowCustomTemplate = ko.observable(false);
                this.setShouldShowCustomTemplate = DW.Utils.extendMethod.call(
                    this,
                    this.setShouldShowCustomTemplate,
                    (result: void, shouldShowCustomTemplate: boolean) =>
                        this.onCustomTemplateVisibilityChange(shouldShowCustomTemplate));
                this._label = ko.observable(this.labels.show);
            } else {
                this._shouldShowCustomTemplate = shouldShowCustomTemplate;
                this.addDisposable(
                    this._shouldShowCustomTemplate.subscribe((shouldShowCustomTemplate) => this.onCustomTemplateVisibilityChange(shouldShowCustomTemplate)));
                this._label = ko.observable(shouldShowCustomTemplate() ? this.labels.hide : this.labels.show);
            }
        }

        private initCustomTemplateVisibilityChangeCommand(canChangeCustomTemplateVisibility: () => boolean) {
            this._customTemplateVisibilityChangeCommand = new DW.Command({
                execute: () => this.setShouldShowCustomTemplate(!this.shouldShowCustomTemplate),
                canExecute: canChangeCustomTemplateVisibility
            });
        }

        constructor(params: MoreOptionsVMParams<T>) {
            super();

            let {
                vm,
                labels = {
                    show: localize('Show_More_Options_Label'),
                    hide: localize('Show_Less_Options_Label')
                },
                canChangeCustomTemplateVisibility,
                shouldShowCustomTemplate
            } = params;

            this.labels = labels;
            this.initShouldShowCustomTemplate(shouldShowCustomTemplate);
            this.initCustomTemplateVisibilityChangeCommand(canChangeCustomTemplateVisibility);
            this._vm = vm;
            this._templateName = params.templateName;
       }
    }
}