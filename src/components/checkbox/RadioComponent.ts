
import * as ko from "knockout";
import { SelectionComponentVM } from "./SelectionComponentVM";
import { ISelectionComponentOptions } from "./Interfaces/SelectionComponentInterfaces";

ko.components.register('radio', {
    viewModel: (options: ISelectionComponentOptions) => new SelectionComponentVM(options),
    template: require("./RadioButton.html")
});