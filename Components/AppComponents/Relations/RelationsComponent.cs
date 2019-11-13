using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
	public class RelationsComponent : ComponentDefinition
	{
		public RelationsComponent() 
			: base(scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization(), dependencies: GetDependencies())
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

		private static List<ResourceDefinition> GetScripts()
		{
			var t = typeof(RelationsComponent);
			return new List<ResourceDefinition>(new []
			{
				"TypedSettingsHeader.js",
				"RelationsTableRowVM.js",
				"RelationsVM.js",
				"Relations.js"
			}
			.Select(s => new ResourceDefinition(t, $"{SharedAppComponentsPath}/Relations/Scripts/{s}")));
		}

		private static List<ResourceDefinition> GetTemplates()
		{
			return new List<ResourceDefinition>(new []
			{
				"UsersAndRolesPopover.html",
				"Relations.html"
			}
			.Select(s => new ResourceDefinition(typeof(RelationsComponent), $"{SharedAppComponentsPath}/Relations/Templates/{s}")));
		}

		private static LocalizationDefinition GetLocalization()
		{
			return new LocalizationDefinition("Relations", "~/bin/SharedResources/Components/AppComponents/Relations/Localization");
		}
	}
}
