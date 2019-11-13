namespace DW.Relations {
    export class TypedSettingsHeader extends dev.docuware.com.settings.interop.SettingsHeader {
        constructor(
            public type: dev.docuware.com.settings.relations.RelationSettingsType,
            public header: dev.docuware.com.settings.interop.SettingsHeader) {
            super();

            this.Guid = header.Guid;
            this.ID = header.ID;
            this.Name = header.Name;
        }
    }
}