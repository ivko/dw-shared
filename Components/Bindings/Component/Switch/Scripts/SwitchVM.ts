namespace DWTS {

    export class SwitchVM extends DWTS.ViewModel {
        public checked: KnockoutObservable<boolean>;
        public enable: KnockoutObservable<boolean>;
        public text: KnockoutObservable<string>;
        constructor(params: {
                checked: boolean | KnockoutObservable<boolean>,
                text: string | KnockoutObservable<string>,
                enable: boolean | KnockoutObservable<boolean>
            }) {

            super();

            let options = $.extend({
                checked: true,
                text: "",
                enable: true,
                test: '',
                id: DW.Utils.nextId('switch')
            }, params);

            Object.keys(options).forEach(key => {
                if (ko.isObservable(options[key])) {
                    this[key] = options[key];
                } else {
                    this[key] = ko.observable(options[key])
                }
            });
        };
    }
}