using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class KnockoutComponent : ComponentDefinition
    {
        public KnockoutComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts(), templates: GetTemplates())
        { }
        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>(),
                ComponentDefinition.Get<DWCoreComponent>(),
                ComponentDefinition.Get<MoreOptionsComponent>()
            };
        }
        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(KnockoutComponent);
            return new List<ResourceDefinition>(new string[]
            {
                //CheckboxRadio Compenent
                "Bindings/Component/CheckboxRadio/Scripts/SelectionComponentVM.js",
                "Bindings/Component/CheckboxRadio/Scripts/CheckboxComponent.js",
                "Bindings/Component/CheckboxRadio/Scripts/RadioComponent.js",

                //Combobox Component                
                "Bindings/Component/Combobox/Scripts/ComboboxVM.js",
                "Bindings/Component/Combobox/Scripts/ComboboxComponent.js",

                //Switch Component
                "Bindings/Component/Switch/Scripts/SwitchVM.js",
                "Bindings/Component/Switch/Scripts/SwitchComponent.js",

                //ColorSelector Component
                "Bindings/Component/ColorSelector/Scripts/ColorSelectorVM.js",
                "Bindings/Component/ColorSelector/Scripts/ColorSelectorComponent.js",


                "Bindings/infobox.js",

                "Bindings/knockout.file.js"

            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/{1}", ComponentDefinition.SharedComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
            {
                //CheckboxRadio Compenent
                "Bindings/Component/CheckboxRadio/Templates/Checkbox.html",
                "Bindings/Component/CheckboxRadio/Templates/RadioButton.html",

                //Combobox Component
                "Bindings/Component/Combobox/Templates/Combobox.html",

                //SwitchComponent
                "Bindings/Component/Switch/Templates/Switch.html",

                //ColorSelectorComponent
                "Bindings/Component/ColorSelector/Templates/ColorSelector.html"
            }
            .Select(s => new ResourceDefinition(typeof(KnockoutComponent), string.Format("{0}/{1}", ComponentDefinition.SharedComponentsPath, s))));
        }
    }
}
