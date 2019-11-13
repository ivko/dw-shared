/// <reference path="../../../../Scripts/TypeScript/lib/WafServices/DataContracts.d.ts" />

namespace DW.ScheduleComponent {
    export class GeneralQuery {
        public SessionID: string;
        public SettingsGuid: string;

        constructor(session: string, guid: string) {
            this.SessionID = session;
            this.SettingsGuid = guid;
        }

        public initialize(): void {};
    }

    export class SetActiveQuery extends GeneralQuery {
        public IsActive: boolean;

        constructor(private isActive: boolean, private session: any, private settingsGuid: string) {
            super(session.SessionID, settingsGuid);
            this.IsActive = isActive;
        }
    }
}
