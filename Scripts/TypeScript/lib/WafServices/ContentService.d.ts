// at this time this file has to be maintained manually

declare module dev.docuware.com.services {
    interface IContentService {
        documentsStored(session: dev.docuware.com.wafservice.ClientServiceSession, query: dev.docuware.com.settings.web.WebBasketQuery): System.Collections.Generic.Dictionary<string, number>;
        getFreeSpace(session: dev.docuware.com.wafservice.ClientServiceSession, query: dev.docuware.com.settings.web.WebBasketQuery): System.Collections.Generic.Dictionary<string, number>;
        getUsedSpace(session: dev.docuware.com.wafservice.ClientServiceSession, query: dev.docuware.com.settings.web.WebBasketQuery): System.Collections.Generic.Dictionary<string, number>;
        getBasketsInfoByLocation(session: dev.docuware.com.wafservice.ClientServiceSession, query: dev.docuware.com.settings.web.WebBasketLocationQuery): Array<dev.docuware.com.settings.web.WebBasketInfo>;
        getSelectListData(session: dev.docuware.com.wafservice.ClientServiceSession, fileCabinet: string, field: string, startsWithCondition: string, sortableDate: boolean): Array<string>;
        getExternalSelectListData(session: dev.docuware.com.wafservice.ClientServiceSession, settings: dev.docuware.com.settings.organization.SelectList, limit: number): Array<any>;
        getTablesNames(session: dev.docuware.com.wafservice.ClientServiceSession, settings: dev.docuware.com.settings.organization.DynamicSelectList): Array<string>;
        getTablesAndViewsSeperated(session: dev.docuware.com.wafservice.ClientServiceSession, settings: dev.docuware.com.settings.organization.DynamicSelectList): Array<System.TupleOfstringstring>
        getColumnNames(session: dev.docuware.com.wafservice.ClientServiceSession, settings: dev.docuware.com.settings.organization.DynamicSelectList): Array<string>;
        checkForSelectListAssignmentIssues(session: dev.docuware.com.wafservice.ClientServiceSession, fileCabinet: string, field: string, settings: dev.docuware.com.settings.organization.SelectList, columnName: string): string;
        checkTableFieldColumnForSelectListAssignmentIssues(session: dev.docuware.com.wafservice.ClientServiceSession, fileCabinet: string, tableFieldGuid: string, tableFieldColumnGuid: string, settings: dev.docuware.com.settings.organization.SelectList, columnName: string): string;
        canSelectListByAssignedToField(session: dev.docuware.com.wafservice.ClientServiceSession, settings: dev.docuware.com.settings.organization.SelectList, columnName: string, field: dev.docuware.com.settings.filecabinet.Field): boolean;
        checkAccessOfIntellixConnection(session: dev.docuware.com.wafservice.ClientServiceSession, connectionGuid: string): boolean;
        getLocalDataSources(session: dev.docuware.com.wafservice.ClientServiceSession): Array<System.TupleOfguidstring>;
        getLocalDataSourceColumnNames(session: dev.docuware.com.wafservice.ClientServiceSession, ldsGuid: string): Array<string>;
        getFulltextAccessible(session: dev.docuware.com.wafservice.ClientServiceSession, fcGuid: string): boolean;
        deployFulltext(session: dev.docuware.com.wafservice.ClientServiceSession, fcGuid: string): void;
        undeployFulltext(session: dev.docuware.com.wafservice.ClientServiceSession, fcGuid: string, deleteCatalog: boolean): void;
    }
}