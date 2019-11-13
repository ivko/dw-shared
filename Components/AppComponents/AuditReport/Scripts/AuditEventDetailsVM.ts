namespace AuditReport {
    import AuditDataContracts = dev.docuware.com.settings.audit;

    export class AuditEventDetailsVM extends DWTS.BusyTriggerVM {
        public additionalDataValues: KnockoutObservableArray<AuditDataContracts.AdditionalDataValue>;
        public tableVM: DWTS.VirtualTableViewModel<AuditDataContracts.AdditionalDataValue>;
        
        constructor(additionalAuditData: AuditDataContracts.AdditionalAuditData) {
            super();

            this.additionalDataValues = this.addDisposable(ko.observableArray<AuditDataContracts.AdditionalDataValue>(additionalAuditData.AdditionalDataValues).trackHasItems());
            this.tableVM = DWTS.VirtualTableViewModel.create<AuditDataContracts.AdditionalDataValue>({
                items: this.additionalDataValues,
                options: { behaviours: {sortable: true}}
            });
        }

    }
}
