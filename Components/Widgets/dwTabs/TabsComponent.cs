using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class TabsComponent : ComponentDefinition
    {
        public TabsComponent()
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
            var t = typeof(TabsComponent);
            return new string[] 
            { 
                "jquery.ui.dwHidden.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/dwHidden/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s)))
            .Concat(new string[] 
            { 
                "jquery.ui.dwTabs.js",
                "ko.bindingHandlers.dwTabs.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/dwTabs/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))))
            .ToList();
        }
    }
}
