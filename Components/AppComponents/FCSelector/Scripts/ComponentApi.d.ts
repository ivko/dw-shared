declare namespace DW.FCSelector {
    export class SourceTargetFileCabinetsVM {
        public finished: JQueryDeferred<void>;
        public getSelectedSourceFC(): STFileCabinet;
        public getSelectedTargetFC(): STFileCabinet;
        public loadSourceRemoteFileCabinets(settingsGuid: string): void;
        public loadTargetRemoteFileCabinets(settingsGuid: string): void;
        public setSyncType(type: SyncType): void;
        public setLocalFileCabinets(fileCabinets: dev.docuware.com.settings.filecabinet.DWFileCabinet[]): void;
        public openConnectionDialog(isTarget: boolean): void;
    }

    export interface ISourceTargetFileCabinetsVMOptions {
        fileCabinets: Array<dev.docuware.com.settings.filecabinet.DWFileCabinet>;
        organizationName: string;
        userName: string;
        sourceFileCabinetInfo: dev.docuware.com.settings.workflows.documentssync.FileCabinetInfo;
        targetFileCabinetInfo: dev.docuware.com.settings.workflows.documentssync.FileCabinetInfo;
        showVersionControlFileCabinet: boolean;
        showOtherOrganizationVersionControlFileCabinet: boolean;
        getRemoteFileCabinets: any;
        isOtherOrganizationSource: boolean;
        isOtherOrganizationTarget: boolean;
        settingsGuid: string;
        dwActivityLeftOffset?: string;
    }

    export class ComponentApi extends DW.BaseComponentApi {
        constructor();
        public createSourceTargetFileCabinetsVM(options: ISourceTargetFileCabinetsVMOptions): SourceTargetFileCabinetsVM;
    }

    export class STFileCabinet {
        Name: string;
        Guid: string;
        Color: string;
        VersionManagement: boolean;
        MasterFCGuid: string;
        ConnectionSettings: ConnectionSettings;
        Fields: Array<dev.docuware.com.settings.filecabinet.Field>;
        IsRemote: boolean;
    }

    export class ConnectionSettings {
        organizationName: string;
        platformUrl: string;
        username: string;
        password: string;
    }

    export enum SyncType {
        Export = 0,
        Sync = 1,
        Custom = 2
    }
}