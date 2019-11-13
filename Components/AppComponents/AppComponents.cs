using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;
namespace DocuWare.Web.Mvc.Resources.SharedResources.Components.AppComponents
{
    public class AppComponents : ComponentDefinition
    {
        public AppComponents()
            : base(dependencies: GetDependencies())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies() 
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>(),
                ComponentDefinition.Get<DWCoreComponent>(),
                ComponentDefinition.Get<DWUIComponent>(),
                ComponentDefinition.Get<ErrorComponent>(),

                ComponentDefinition.Get<NameDescriptionComponent>(),
                ComponentDefinition.Get<ToggleItemComponent>(),
                ComponentDefinition.Get<AssignUsersAndRolesComponent>(),
                ComponentDefinition.Get<AuditReportComponent>()
            };
        }

    }
}
