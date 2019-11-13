declare namespace DW.ScheduleComponent {
    export class ScheduleVM {
        getSettings: () => any;
        //ComponentApi: (settings: any) => any;
    }

    export interface IScheduleVMOptions {

    }

    export class ShowSections {
        public showMinutely?: boolean;
        public showHourly?: boolean;
        public showDaily?: boolean;
        public showWeekly?: boolean;
        public showMonthly?: boolean
    }

    export class ComponentApi extends DW.BaseComponentApi {
        constructor(options?: IScheduleVMOptions);
        public getComponentViewModel(scheduleSettings: any, minimumMinutes?: number, showMinimumMinutesInfobox?: boolean, showSections?: ShowSections): ScheduleVM;
    }

    export module TimeZoneMapping {
        export var DisplayValues: Array<string>;
        export var IanaValues: Array<string>;
    }
}
