namespace DWTS {
    export class ColorSelectorVM extends DWTS.ViewModel {
        public selectedColor: KnockoutObservable<string>;
        public colorList: Array<{ argb: string, hex: string }>;
        constructor(params: { colorAsString: KnockoutObservable<string> }) {
            super();
            this.colorList = DW.Utils.getColors();
            this.selectedColor = params.colorAsString;
        };
    }
}