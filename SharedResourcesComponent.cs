using DocuWare.Web.Mvc.Resources.Bundling;
using DocuWare.Web.Mvc.Resources.Bundling.Base;
using DocuWare.Web.Resources; //TODO: remove and use components only
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class SharedResourcesComponent : ComponentDefinition
    {
        public SharedResourcesComponent()
            : base(dependencies: GetDependencies())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                 Get<ExternalComponent>(),
                 Get<DWCoreComponent>(),
                 Get<DWUIComponent>(),
                 Get<AppComponents.AppComponents>()
            };
        }
    }
}
