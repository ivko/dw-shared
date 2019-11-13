namespace DWTS.Interfaces.Tooltip {

    export interface IBaseTooltipOptions {
        title: any, // string || KnockoutObservable<string>
        container: string,
        placement: any,
        animation: boolean,
        reserveValue: string,
        addWidth: number,
        forseUpdate: boolean,
        html: boolean,
        // optional
        optionsTitle?: string,
        optionsValue?: string,
        optionsValueParam?: string,
        titles?: Array<any>,
        selectTitle?: string,
        selectValue?: string,
        trackObservable?: boolean,
        delay?: number
    }

    export interface IHtmlRendererTooltipOptions extends IBaseTooltipOptions {
        title: KnockoutObservable<string>,
        viewModel: any,
        templateName: string
    }
}   
