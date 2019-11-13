using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class SpectrumComponent : ComponentDefinition
    {
        public SpectrumComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts())
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
            var t = typeof(SpectrumComponent);
            return new List<ResourceDefinition>(new string[] 
            {
                ComponentDefinition.SharedWidgetComponentsPath + "/spectrum/js/spectrum.js",
                ComponentDefinition.SharedWidgetComponentsPath + "/spectrum/js/ko.bindingHandlers.spectrum.js",
                ComponentDefinition.SharedComponentsPath + "/Bindings/jQueryUI/ko.bindingHandlers.spinner.js"
            }
            .Select(s => new ResourceDefinition(t, s)));
        }
    }
}
