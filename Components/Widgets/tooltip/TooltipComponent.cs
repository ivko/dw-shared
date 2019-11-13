using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class TooltipComponent : ComponentDefinition
    {
        public TooltipComponent()
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
            var t = typeof(TooltipComponent);
            return new string[] 
            {
                "~/SharedResources/Components/Widgets/tooltip/Scripts/tooltipConditions.js",
                "~/SharedResources/Components/Widgets/tooltip/Scripts/ui.tooltip.js",
                "~/SharedResources/Components/Widgets/tooltip/Scripts/ko.tooltip.js"
            }
            .Select(s => new ResourceDefinition(t, s))
            .ToList();
        }
    }
}
