using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class SelectComponent : ComponentDefinition
    {
        public SelectComponent()
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
            var t = typeof(SelectComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "select2.js",
                "ko.bindingHandlers.select2.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/select/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
    }
}
