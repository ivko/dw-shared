namespace DWTS.Interfaces.Components.ComboboxComponent {
    export interface IValueSelectorOptions<T> {
        getSelectedControllerItem: (selectedItem:T, valueProp: string) => any,
        findItem: (newValue: string, availableItems: Array<any>, valueProp: string) => any,
        getItemValue: (item: T, valueProp: string) => string, 
        buildInaccessibleItem: (item: string, displayProp: string, invalidResource: string, valueProp: string) => any
    }

    export interface IComboboxCaptionOptions {
        text: string,
        noneText: string,
        value: string
    }

    export interface IComboboxComponentOptions<T> {
        useFullObject: boolean;
        options: KnockoutObservableArray<any>;
        optionsValue: string;
        optionsText: string;
        value: KnockoutObservable<T>;
        isValidSelected: KnockoutObservable<boolean>;
        captionValue: string;
        captionText: string;
        captionNoneText: string;
        invalidResource: string;
        enabled: () => boolean;
        elementAttributes: { class: string, id: string };
        lock: () => boolean;
        filter: (items: Array<any>, item: KnockoutObservable<T>) => Array<any>;
        valueSelector: IValueSelectorOptions<T>;
        orderAlphabetically: boolean;
    }

} 