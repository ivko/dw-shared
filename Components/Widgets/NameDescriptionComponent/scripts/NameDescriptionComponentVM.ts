namespace DWTS.NameDescriptionComponent {

    export interface IBasicEditableInfo {
        text: KnockoutObservable<string>,
        textTooltip?: string,
        tooltipPlacement?: string,
        isReadonly?: KnockoutObservable<boolean>,
        container?: string,
        valueUpdate?: string
    }

    export interface INameComponentParams extends IBasicEditableInfo {
        hasTextValidation: boolean
        isEditingImmediately?: boolean | KnockoutObservable<boolean>;
    }

    function basicEditableInfoFactory(basicInfo: IBasicEditableInfo) {
        return {
            text: basicInfo.text,
            textTooltip: basicInfo.textTooltip || "",
            isReadonly: basicInfo.isReadonly || false,
        };
    }

    export class BasicInfoVM extends DWTS.ViewModel {
        public text: KnockoutObservable<string>;
        public tooltipPlacement: string;
        public textTooltip: string;
        public isReadonly: KnockoutObservable<boolean>;
        public container: string;
        public valueUpdate: string;

        constructor(basicParams: IBasicEditableInfo) {
            super();

            this.text = basicParams.text;
            this.text.extend({ editable: true });
            this.textTooltip = basicParams.textTooltip || "";
            this.tooltipPlacement = basicParams.tooltipPlacement;
            this.isReadonly = basicParams.isReadonly || ko.observable(false);
            this.container = basicParams.container || "body";
            this.valueUpdate = basicParams.valueUpdate || "input";
        }
    }

    export class NameComponentVM extends BasicInfoVM {
        public hasNameValidation: boolean;
        public isEditingImmediately: KnockoutObservable<boolean>;

        constructor(extendedParams: INameComponentParams) {
            super(extendedParams);
            this.hasNameValidation = extendedParams.hasTextValidation !== false;
            this.isEditingImmediately = ko.isObservable(extendedParams.isEditingImmediately) ?
                <KnockoutObservable<boolean>>extendedParams.isEditingImmediately :
                ko.observable(<boolean>!!extendedParams.isEditingImmediately);

            if (this.isEditingImmediately()) {
                this.text.beginEdit();
            }
        }

        public editNameStop() {
            if (!this.text.isValid || this.text.isValid()) {
                this.text.commit();
            }
        }
    }
}

// Conditional AMD loading
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["knockout", "ko.editables"], factory);
    } else {
        factory(ko);
    }
}(function (ko) {
    ko.components.register("name-component", {
        viewModel: function (params: DWTS.NameDescriptionComponent.INameComponentParams) {
            //return new NameComponentVM(params.namska4ast, create(params));
            return new DWTS.NameDescriptionComponent.NameComponentVM(params);
        },
        template: { element: "name-component-template" }
    });

    ko.components.register("description-component", {
        viewModel: function (params: DWTS.NameDescriptionComponent.IBasicEditableInfo) {
            return new DWTS.NameDescriptionComponent.BasicInfoVM(params);
        },
        template: { element: "description-component-template" }
    });

    ko.components.register("name-description-component", {
        viewModel: function (params: { nameParams: DWTS.NameDescriptionComponent.INameComponentParams, descParams: DWTS.NameDescriptionComponent.IBasicEditableInfo }) {
            return {
                name: new DWTS.NameDescriptionComponent.NameComponentVM(params.nameParams),
                desc: new DWTS.NameDescriptionComponent.BasicInfoVM(params.descParams),
            };
        },
        template: { element: "name-description-template" }
    });
}));