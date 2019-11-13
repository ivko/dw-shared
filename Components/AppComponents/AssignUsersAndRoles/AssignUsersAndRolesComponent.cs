using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class AssignUsersAndRolesComponent : ComponentDefinition
    {
        public AssignUsersAndRolesComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                //new ComponentDependency(ComponentDefinition.Get<ExternalComponent>()),
                //new ComponentDependency(ComponentDefinition.Get<DWCoreComponent>()),
                //new ComponentDependency(ComponentDefinition.Get<DWUIComponent>()),
                ComponentDefinition.Get<KnockoutComponent>(),
                ComponentDefinition.Get<TableComponent>(),
                ComponentDefinition.Get<ToggleItemComponent>()
            };
        }
        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("UsersAndRoles", "~/bin/SharedResources/Components/AppComponents/AssignUsersAndRoles/Localization");
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(AssignUsersAndRolesComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "AssignUsersAndRoles/Scripts/ComponentApi.js",
                "AssignUsersAndRoles/Scripts/UsersAndRolesDialog.js",
                "AssignUsersAndRoles/Scripts/UsersAndRolesDialogVM.js",
                "AssignUsersAndRoles/Scripts/UsersAndRolesTableVM.js",
                "AssignUsersAndRoles/Scripts/RelationsInfoBuilderVM.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[] 
            {
                "AssignUsersAndRoles/Templates/UsersAndRolesDialog.html"
            }
            .Select(s => new ResourceDefinition(typeof(AssignUsersAndRolesComponent), string.Format("{0}/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }
    }
}