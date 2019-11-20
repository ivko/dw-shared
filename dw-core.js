import * as $ from "jquery";
import * as ko from "knockout";
import * as Utils from "./Components/utils";
export function myWhen() {
    return $.when.apply(this, arguments);
}
console.log(ko);