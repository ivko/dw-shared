using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class AccordionComponent : ComponentDefinition
    {
        public AccordionComponent()
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
            var t = typeof(AccordionComponent);
            return new string[]
            {
                "jquery.ui.dwAccordion.js",
                "ko.bindingHandlers.dwAccordion.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/dwAccordion/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s)))
            .ToList();
        }
    }
}
