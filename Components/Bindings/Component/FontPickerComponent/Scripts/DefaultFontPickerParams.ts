module DWTS.FontPickerComponent {
    export interface IFontPickerVMParams {
        minSize: number;
        maxSize: number;
        fonts: Array<string>;
        selectedFont: KnockoutObservable<string>;
        size: KnockoutObservable<number>;
        bold: KnockoutObservable<boolean>;
        italic: KnockoutObservable<boolean>;
        underline: KnockoutObservable<boolean>;
        strikeout: KnockoutObservable<boolean>;
        color: KnockoutObservable<string>;
        label: string;
        previewText: string;
    }
}