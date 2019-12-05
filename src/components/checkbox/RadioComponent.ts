
import * as ko from "knockout";
import { SelectionComponentVM } from "./SelectionComponentVM";
import { ISelectionComponentOptions } from "./Interfaces/SelectionComponentInterfaces";

require("./RadioButton.html");

ko.components.register('radio', {
    viewModel: (options: ISelectionComponentOptions) => new SelectionComponentVM(options),
    template: { element: 'radio-template' }
});