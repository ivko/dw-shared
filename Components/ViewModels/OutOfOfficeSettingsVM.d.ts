declare module DW {
    import DataContracts = dev.docuware.com.settings;

    export interface IOutOfOfficeErrorMessages {
        reverceDates: string;
        requiredDate: string;
    }
    export interface IOutOfOfficeFormatters {
        fromServer: () => any;
        toServer: () => any;
    }
    export class OutOfOfficeSettingsVM extends DWTS.ViewModel {
        isOutOfTheOffice: KnockoutObservable<boolean>;
        fromDate: KnockoutObservable<Date>;
        untilDate: KnockoutObservable<Date>;
        constructor(settings: DataContracts.usermanagement.OutOfOffice, errorMessages: IOutOfOfficeErrorMessages, formatters?: IOutOfOfficeFormatters);
        getValidSettings(settings: DataContracts.usermanagement.OutOfOffice, errorMessages: IOutOfOfficeErrorMessages): DataContracts.usermanagement.OutOfOffice;
        buildSettings(): DataContracts.usermanagement.OutOfOffice;
        hasChanges(): boolean;
        getErrors(): Array<string>;
        mergeUIToSettings(settings: DataContracts.usermanagement.OutOfOffice): DataContracts.usermanagement.OutOfOffice;
    }
}