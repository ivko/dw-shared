/// <reference path="AuditEventDetailsVM.ts" />

namespace AuditReport {

    export interface IAuditingDetailsService /*extends DWTS.IDisposable */ {
        getAuditingLogs(query: AuditingLogsQuery): JQueryPromise<AuditingLog>;
        getAuditLogDetails(auditEntryId?: string): JQueryPromise<dev.docuware.com.settings.audit.AdditionalAuditData>;
        exportAuditReport(filterQuery: IFilterQuery): JQueryPromise<any>;
        getExportUrl(): JQueryPromise<string>;
    }

    export interface IFilterQuery {
        fromDate: KnockoutObservable<Date>,
        toDate: KnockoutObservable<Date>
    }

    export interface IBaseAuditEntry {
        AuditEntryId: string;
        AuditEntryLoggedDate: Date;
        DocId: number;
        SettingsChangedName: string;
        UserInitiatingChange: string;
        EventType: number;
        SettingsChangedType: number;
    }

    export enum AuditSourceTypes {
        System,
        Organization,
        FileCabinet,
        Document
    }

    export class AuditTableTemplates {
        public header: string;
        public row: string;
        public scroll?: string;
        public scrollView?: any;
    }

    //used like criteria for retrieving details information about FC, System, Organization or Document audit
    export class AuditingLogsQuery {
        sourceGuid: string;
        fromDate: Date;
        toDate: Date;
        startAt: number;
        count: number;
    }

    export class AuditingEventSettings {
        public auditEntryId: string;
        public auditEntryLoggedDate: string;
        public docId: number;
        public event: string;
        public settingsChangedName: string;
        public settingsChangedType: string;
        public userInitiatingChange: string;

        constructor(data: IBaseAuditEntry,
                    eventTypeMap: { [id: string]: string },
                    settingsTypeMap: { [id: string]: string },
                    public hasToLocalizeName: () => boolean ) {

            this.auditEntryId = data.AuditEntryId;
            this.auditEntryLoggedDate = DW.DateTime.getLocalizedDateTimeString(data.AuditEntryLoggedDate);
            this.docId = data.DocId;
            this.event = eventTypeMap[data.EventType];
            this.settingsChangedName = data.SettingsChangedName;
            this.settingsChangedType = settingsTypeMap[data.SettingsChangedType];
            this.userInitiatingChange = data.UserInitiatingChange;
        }
    }
    
    export class AuditingLog { 
        logs: Array<AuditingEventSettings>;
        count: number;
    }


    export class AuditEventsVM extends DWTS.ViewModel {
        public loadingDetails: KnockoutObservable<boolean> = ko.observable(false);
        public detailsVM: KnockoutObservable<AuditEventDetailsVM> = ko.observable(null);
        public loadEventDetails: () => JQueryPromise<void>;

        constructor(public data: AuditingEventSettings,
                    private service: IAuditingDetailsService) {
            super();

            this.loadEventDetails = DW.Utils.lazyDeferredForPromises(this.loadEventDetailsInternal.bind(this));
        }

        public loadEventDetailsInternal() {
            this.loadingDetails(true);
            return this.service.getAuditLogDetails(this.data.auditEntryId)
                .then((additionalAuditData: dev.docuware.com.settings.audit.AdditionalAuditData) => {
                    this.detailsVM(new AuditEventDetailsVM(additionalAuditData));
                })
                .fail((error) => { DW.Utils.handleError(error) })
                .always(() => {
                    this.loadingDetails(false);
                });
        }

        public dispose() {
            if (this.detailsVM())
                this.detailsVM().dispose();

            super.dispose();
        }
    }
}
