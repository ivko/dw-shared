using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;


namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ValueFormattingComponent : ComponentDefinition
    {
        public ValueFormattingComponent()
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
            var t = typeof(ValueFormattingComponent);
            return new string[]
            {
                "DateTime/jquery.plugin.js",

                "DateTime/calendars/js/jquery.calendars.js",
                "DateTime/calendars/js/jquery.calendars.islamic.js",
                "DateTime/calendars/js/jquery.calendars.picker.js",
                "DateTime/calendars/js/jquery.calendars.picker.ext.js",
                "DateTime/calendars/js/jquery.calendars.picker-ar.js",
                "DateTime/calendars/js/jquery.calendars.picker-bg.js",
                "DateTime/calendars/js/jquery.calendars.picker-de.js",
                "DateTime/calendars/js/jquery.calendars.picker-el.js",
                "DateTime/calendars/js/jquery.calendars.picker-en-GB.js",
                "DateTime/calendars/js/jquery.calendars.picker-es.js",
                "DateTime/calendars/js/jquery.calendars.picker-fr.js",
                "DateTime/calendars/js/jquery.calendars.picker-hr.js",
                "DateTime/calendars/js/jquery.calendars.picker-it.js",
                "DateTime/calendars/js/jquery.calendars.picker-ja.js",
                "DateTime/calendars/js/jquery.calendars.picker-nl.js",
                "DateTime/calendars/js/jquery.calendars.picker-pl.js",
                "DateTime/calendars/js/jquery.calendars.picker-pt-BR.js",
                "DateTime/calendars/js/jquery.calendars.picker-ru.js",
                "DateTime/calendars/js/jquery.calendars.picker-sv.js",
                "DateTime/calendars/js/jquery.calendars.picker-zh-CN.js",
                "DateTime/calendars/js/jquery.calendars.plus.js",
                "DateTime/calendars/js/jquery.calendars.ummalqura.js",

                "DateTime/CommonDateTimeDefaults.js",      
                "DateTime/calendars/js/CalendarPickerDefaults.js",
                "DateTime/BaseDatePickerBindingHandler.js",
                "DateTime/DatePickerBindingHandler.js",

                "DateTime/dateEntry/jquery.dateentry.js",
                "DateTime/dateEntry/DateEntryDefaults.js",
                "DateTime/dateEntry/ko.datePickerBinding.js",
                "DateTime/dateEntry/DatePickerFormatter.js",

                "DateTime/timeEntry/jquery.timeentry.js",
                "DateTime/timeEntry/TimeEntryDefaults.js",
                "DateTime/timeEntry/ko.timeEntryBinding.js",

                "DateTime/dateTimeEntry/jquery.datetimeentry.js",
                "DateTime/dateTimeEntry/DateTimeEntryDefaults.js",
                "DateTime/dateTimeEntry/DateTimePickerBindingHandler.js",
                "DateTime/dateTimeEntry/ko.dateTimePickerBinding.js",
                "DateTime/dateTimeEntry/DateTimePickerFormatter.js",

                "DateTime/DatePickerRangeDecorators.js",
                "DateTime/ReadOnlyDatePickerBindingHandler.js",

                "numeric/js/jquery.numeric.js",
                "numeric/js/utils.numeric.js",
                "numeric/js/ko.numericBinding.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/{1}", ComponentDefinition.SharedWidgetComponentsPath, s)))      
            .ToList();
        }
    }
}