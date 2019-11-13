using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class PopoverComponent : ComponentDefinition
    {
        public PopoverComponent()
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
            var t = typeof(PopoverComponent);
            return new string[] 
            { 
                "~/SharedResources/Components/Widgets/popover/Scripts/jquery.ui.popover.js",
                "~/SharedResources/Components/Widgets/popover/Scripts/ko.popover.js"
            }
            .Select(s => new ResourceDefinition(t, s))
            .ToList();
        }
    }
}
