using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class TimeLoggerComponent : ComponentDefinition
    {
        public TimeLoggerComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts())
        { }
        private static List<ComponentDependency> GetDependencies()
        {
            return new List<ComponentDependency>() 
            {
                new ComponentDependency(ComponentDefinition.Get<CommandsComponent>())
            };
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(TimeLoggerComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "TimeLigger.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/{1}", "~/Scripts", s))));
        }
    }
}
