using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ScrollbarComponent : ComponentDefinition
    {
        public ScrollbarComponent()
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
            var t = typeof(ScrollbarComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "jquery.ui.dwScrollbar.js",
                "ko.bindingHandlers.dwScrollbar.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/dwScrollbar/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
    }

}
