namespace DWTS.FontPickerComponent {

    export class FontPickerVM extends Disposable {
        public selectedFont: KnockoutObservable<string>;
        public size: KnockoutObservable<number>;
        public bold: KnockoutObservable<boolean>;
        public italic: KnockoutObservable<boolean>;
        public underline: KnockoutObservable<boolean>;
        public strikeout: KnockoutObservable<boolean>;
        public style: KnockoutComputed<string>;
        public color: KnockoutObservable<string>;
        public componentId: string;
        private textDecoration: KnockoutComputed<string>;
        constructor(public params: IFontPickerVMParams) {
            super();
            const p = params;
            this.componentId = DW.Utils.guid();
            this.selectedFont = p.selectedFont;
            this.size = p.size;
            this.bold = p.bold;
            this.italic = p.italic;
            this.underline = p.underline;
            this.strikeout = p.strikeout;
            this.color = p.color;

            this.textDecoration = this.addDisposable(ko.computed(() => {
                let style =
                    `font-weight:${(this.bold && this.bold()) ? "bold;" : "normal;"}font-style:${(this.italic && this.italic())
                        ? "italic;"
                        : "normal;"
                        }`;

                if ((this.underline && this.underline()) || (this.strikeout && this.strikeout())) {
                    style += "text-decoration:";
                    if (this.underline && this.underline())
                        style += " underline";
                    if (this.strikeout && this.strikeout())
                        style += " line-through";
                    style += ";";
                }

                return style;
            }));

            this.style = this.addDisposable(ko.computed(() => {
                let style = `font-size:${this.size()}pt; font-family:${this.selectedFont()};`;
                if (this.color)
                    style += `color: ${this.color()};`;
                return style + this.textDecoration();
            }));
        }

        public fontFamilyFormat(object) {
            //todo: 
            //when we have font families that contains empty spaces, in web client we are add quotes and this
            //function is not representing the format correctly. How are we going to deal with this problem?
            return `<span class="font" style="font-family:'${object.id}',serif;">${object.text}</span>`;
        }
    }
}