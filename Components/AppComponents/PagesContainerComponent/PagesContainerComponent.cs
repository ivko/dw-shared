using DocuWare.Web.Mvc.Resources.Bundling;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class PagesContainerComponent : ComponentDefinition
    {
        public PagesContainerComponent()
          : base(dependencies: GetDependencies(), scripts: GetScripts(), templates: GetTemplates())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>(),
                ComponentDefinition.Get<DWCoreComponent>(),
                ComponentDefinition.Get<DWUIComponent>()
            };
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(PagesContainerComponent);
            return new List<ResourceDefinition>(new string[]
            {
                "PageVM.js",
                "PagesContainerVM.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/PagesContainerComponent/Scripts/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
            {
                "PagesContainerComponent.html"
            }
            .Select(s => new ResourceDefinition(typeof(PagesContainerComponent), string.Format("{0}/PagesContainerComponent/Templates/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }
    }
}
