namespace DW.Relations {
    export class RelationsTableRowVM extends TypedSettingsHeader {
        Rights: KnockoutObservableArray<dev.docuware.com.settings.relations.RelationRight>;
        hasUsage: KnockoutComputed<boolean>;
        hasAdmin: KnockoutComputed<boolean>;

        constructor(type: dev.docuware.com.settings.relations.RelationSettingsType,
            header: dev.docuware.com.settings.interop.SettingsHeader,
            rights: Array<dev.docuware.com.settings.relations.RelationRight>) {
            super(type, header);
            this.Rights = ko.observableArray(rights);
            this.hasUsage = ko.computed(() => {
                return this.Rights().some((r) => {
                    return r == dev.docuware.com.settings.relations.RelationRight.Usage;
                });
            });
            this.hasAdmin = ko.computed(() => {
                return this.Rights().some((r) => {
                    return r == dev.docuware.com.settings.relations.RelationRight.Admin;
                });
            });
        }
        public addRight(right: dev.docuware.com.settings.relations.RelationRight) {
            this.Rights.push(right);
        }

        public removeRight(right: dev.docuware.com.settings.relations.RelationRight) {
            this.Rights.remove(right);
        }

        public dispose() {
            this.hasAdmin.dispose();
            this.hasUsage.dispose();
        }
    }
}