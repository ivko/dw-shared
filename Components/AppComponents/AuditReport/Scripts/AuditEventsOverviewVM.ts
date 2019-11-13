/// <reference path="AuditEventVM.ts" />
/// <reference path="../../../widgets/table/scripts/virtualtablevm.ts" />  //TODO: remove fom here

namespace AuditReport {
    var localizationResources = (<any>window).DWResources.AuditReport;
    export function localize(key: string, params?: any) {
        return DW.Utils.format((localizationResources && localizationResources[key]) || key || '', params);
    }

    export class AuditEventsOverviewVM extends DWTS.BusyTriggerVM {
        public auditEvents: KnockoutObservableArray<AuditEventsVM> = ko.observableArray([]);
        public tableVM: DWTS.VirtualTableViewModel<AuditEventsVM>;
        public exportAuditReport: DW.Command;

        constructor(private auditingLogsQuery: AuditingLogsQuery,
            private filterQuery: IFilterQuery,
            private service: IAuditingDetailsService,
            public tableOptions: AuditTableTemplates
        ) {
            super();

            this.tableVM = this.addDisposable(DWTS.VirtualTableViewModel.create<AuditEventsVM>({
                options: {
                    behaviours: {
                        sortable: true,
                        filterable: true
                    },
                    behaviourOptions: {
                        filterable: { filterProperty: 'Date' }
                    },
                    scrollView: tableOptions.scrollView,
                    loadItems: (query: DWTS.Interfaces.Tables.ITableDataProviderQuery = new DWTS.TableDataProviderQuery()) => {
                        this.auditingLogsQuery.startAt = query.range.getStart();
                        this.auditingLogsQuery.count = query.range.getCount();
                        return this.service.getAuditingLogs(this.auditingLogsQuery)
                            .then((entriesData) => {
                                return {
                                    count: entriesData.count,
                                    items: entriesData.logs.map((log) => {
                                        log.event = AuditReport.localize(DW.Utils.format("{0}_{1}", ['AuditReport_EventType', log.event]));
                                        log.settingsChangedType = AuditReport.localize(DW.Utils.format("{0}_{1}", ['AuditReport_SettingsType', log.settingsChangedType]));
                                        log.settingsChangedName = log.hasToLocalizeName ? AuditReport.localize(log.settingsChangedName) : log.settingsChangedName;
                                        return new AuditEventsVM(log, this.service);
                                    })
                                };
                            })
                            .fail((error) => {
                                DW.Utils.handleError(error);
                            });
                    }
                }
            }));
            this.tableVM.setRowHeight(32);

            this.exportAuditReport = this.addDisposable(new DW.Command({
                execute: () => {
                    return this.service.exportAuditReport(this.filterQuery)
                        .fail((error) => {
                            DW.Utils.handleError(error);
                        });
                }
            }));
        }

        public reloadAuditLogs(query: AuditingLogsQuery): JQueryPromise<void> {
            this.auditingLogsQuery = query;
            return this.tableVM.reloadItems();        
        }
    }

}
