using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ScheduleComponent : ComponentDefinition
    {
        public ScheduleComponent()
            : base(scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization())
        { }
                
        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("Schedule", "~/bin/SharedResources/Components/AppComponents/Schedule/Localization");
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(ScheduleComponent);
            return new List<ResourceDefinition>(new [] 
            {
                "Utils.js",
                "TimeZoneMapping.js",
                "ComponentApi.js",
	            "ScheduleVM.js",
	            "WorkflowScheduleResult.js"
			}
		    .Select(s => new ResourceDefinition(t, string.Format("{0}/Schedule/Scripts/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

		private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new [] 
            { 
                "Schedule.html"
            }
            .Select(s => new ResourceDefinition(typeof(ScheduleComponent), string.Format("{0}/Schedule/Templates/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }
    }
}