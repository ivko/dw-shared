

import * as ko from "knockout";
import { SelectionComponentVM } from "./SelectionComponentVM";
import { ISelectionComponentOptions } from "./Interfaces/SelectionComponentInterfaces";
require("./Checkbox.html");
ko.components.register('checkbox', {
    viewModel: (options: ISelectionComponentOptions) => new SelectionComponentVM(options),
    template: { element: 'checkbox-template' }
});
