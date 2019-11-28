// at this time this file has to be maintained manually

declare module dev.docuware.com.services.settings {
    interface IAuditService {
        getSystemAuditEntries(session: dev.docuware.com.wafservice.ClientServiceSession, fromDate: Date, toDate: Date, startAt: number, count: number): dev.docuware.com.settings.audit.SystemAuditEntries;
        getSystemAuditAdditionalData(session: dev.docuware.com.wafservice.ClientServiceSession, id: string): dev.docuware.com.settings.audit.AdditionalAuditData;
        getSystemAuditNumberOfEntries(session: dev.docuware.com.wafservice.ClientServiceSession): number;
        deleteSystemAuditData(session: dev.docuware.com.wafservice.ClientServiceSession): void;
        getOrganizationAuditEntries(session: dev.docuware.com.wafservice.ClientServiceSession, fromDate: Date, toDate: Date, startAt: number, count: number): dev.docuware.com.settings.audit.OrganizationAuditEntries;
        getOrganizationAuditAdditionalData(session: dev.docuware.com.wafservice.ClientServiceSession, id: string): dev.docuware.com.settings.audit.AdditionalAuditData;
        getOrganizationAuditNumberOfEntries(session: dev.docuware.com.wafservice.ClientServiceSession): number;
        deleteOrganizationAuditData(session: dev.docuware.com.wafservice.ClientServiceSession): void;
        getFileCabinetAuditEntries(session: dev.docuware.com.wafservice.ClientServiceSession, fileCabinetGuid: string, fromDate: Date, toDate: Date, startAt: number, count: number): dev.docuware.com.settings.audit.FileCabinetAuditEntries;
        getFileCabinetAuditEntriesForDocument(session: dev.docuware.com.wafservice.ClientServiceSession, fileCabinetGuid: string, docId: number, fromDate: Date, toDate: Date, startAt: number, count: number): dev.docuware.com.settings.audit.FileCabinetAuditEntries;
        getFileCabinetAuditAdditionalData(session: dev.docuware.com.wafservice.ClientServiceSession, fileCabinetGuid: string, id: string): dev.docuware.com.settings.audit.AdditionalAuditData;
        getFileCabinetAuditNumberOfEntries(session: dev.docuware.com.wafservice.ClientServiceSession, fileCabinetGuid: string): number;
        deleteFileCabinetAuditData(session: dev.docuware.com.wafservice.ClientServiceSession, fileCabinetGuid: string): void;
    }
}