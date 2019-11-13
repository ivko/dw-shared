using DocuWare.Web.Mvc.Resources.Bundling;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class AuditReportComponent : ComponentDefinition
    {
        public AuditReportComponent()
            : base(/*dependencies: GetDependencies(),*/ scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization())
        { }

        //private static IEnumerable<ComponentDefinition> GetDependencies()
        //{
        //    return new ComponentDefinition[]
        //    {
        //        ComponentDefinition.Get<ExternalComponent>(),
        //        ComponentDefinition.Get<DWCoreComponent>(),
        //        ComponentDefinition.Get<DWUIComponent>(),
        //        ComponentDefinition.Get<AppComponents>()
        //    };
        //}

        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("AuditReport", "~/bin/SharedResources/Components/AppComponents/AuditReport/Localization");
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(QueryBuilderComponentApi);
            return new List<ResourceDefinition>(new string[]
            {
                "AuditReport/Scripts/AuditEventDetailsVM.js",
                "AuditReport/Scripts/AuditEventsOverviewVM.js",
                "AuditReport/Scripts/AuditEventVM.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
            {
                "AuditReport/Templates/AuditReportTemplates.html"
            }
            .Select(s => new ResourceDefinition(typeof(QueryBuilderComponentApi), string.Format("{0}/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }
    }
}
