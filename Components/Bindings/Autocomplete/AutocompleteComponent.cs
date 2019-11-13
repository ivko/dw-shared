using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class AutocompleteComponent: ComponentDefinition
    {
        public AutocompleteComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts(), templates: GetTemplates())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>(),
                ComponentDefinition.Get<DWCoreComponent>()
            };
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(AutocompleteComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "AutocompleteVM.js",
                "AutocompleteListVM.js",
                "AutocompleteBehavior.js",
                "DataProvider/BaseDataProvider.js",
                "ko.autocompleteMenu.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/Bindings/Autocomplete/Scripts/{1}", ComponentDefinition.SharedComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
            {
                "autocompleteMenu.html"
            }
            .Select(s => new ResourceDefinition(typeof(AutocompleteComponent), string.Format("{0}/Bindings/Autocomplete/Templates/{1}", ComponentDefinition.SharedComponentsPath, s))));
        }
    }
}
