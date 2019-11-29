

import * as ko from "knockout";
import { SelectionComponentVM } from "./SelectionComponentVM";
import { ISelectionComponentOptions } from "./Interfaces/SelectionComponentInterfaces";

ko.components.register('checkbox', {
    viewModel: (options: ISelectionComponentOptions) => new SelectionComponentVM(options),
    template: require("./Checkbox.html")
});
