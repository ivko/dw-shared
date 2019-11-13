using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
	public class CredentialsDialogComponent : ComponentDefinition
	{
		public CredentialsDialogComponent()
			: base(scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization(), dependencies: GetDependencies())
		{ }

		private static IEnumerable<ComponentDefinition> GetDependencies()
		{
			return new ComponentDefinition[]
			{
				ComponentDefinition.Get<DialogsComponent>()
			};
		}

		private static List<ResourceDefinition> GetScripts()
		{
			var t = typeof(CredentialsDialogComponent);
			return new List<ResourceDefinition>(new []
				{
					"CredentialsDialogVM.js",
					"CredentialsDialog.js"
				}
				.Select(s => new ResourceDefinition(t, $"{ComponentDefinition.SharedAppComponentsPath}/CredentialsDialog/Scripts/{s}")));
		}

		private static List<ResourceDefinition> GetTemplates()
		{
			return new List<ResourceDefinition>(new []
				{
					"CredentialsDialog.html"
				}
				.Select(s => new ResourceDefinition(typeof(CredentialsDialogComponent), $"{ComponentDefinition.SharedAppComponentsPath}/CredentialsDialog/Templates/{s}")));
		}

		private static LocalizationDefinition GetLocalization()
		{
			return new LocalizationDefinition("CD", "~/bin/SharedResources/Components/AppComponents/CredentialsDialog/Localization");
		}
	}
}
