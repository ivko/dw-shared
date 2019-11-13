namespace DWTS.ErrorHandlers {
    var localizationResources = (<any>window).DWResources.Error;
    export function localize(key: string, params?: any) {
        return DW.Utils.format((localizationResources && localizationResources[key]) || key || '', params);
    }

    export function onError(xhr, ajaxOptions, thrownError, ignoreErrors, onUnauthorized, callback) {
        let error: any = { responseText: localize('ConnectionFailed'), error: true, errorCode: 200 };
        if (xhr.status == 401) {
            error.errorCode = 401;
            //in case of unauthorized in WAF we don't show errors as oppose to web client!
            if (!!onUnauthorized) {
                showError(error);
                onUnauthorized();
                return;
            }
            else if (!ignoreErrors) {
                if (xhr.statusText) error.responseText = xhr.statusText;
                showError(error);
            }
        }
        else if (xhr.status != 200 && xhr.status != 302 && xhr.status != 304)
            error = errorHandler(xhr, ajaxOptions, thrownError, ignoreErrors);
        else if (xhr.responseText) // If this is a correct status call and if there is a response text then the raw data comming from the server is in it!
            error = xhr.responseText;
        else
            error = null;

        if (!!callback)
            callback(error);
    };

    export function errorHandler(xhr, ajaxOptions, thrownError, ignoreErrors) {
        var result = { error: true, errorCode: xhr ? xhr.status : 520, internalCode: undefined, responseText: localize('UnknownError') };
        if (ajaxOptions != "abort" && thrownError != "abort" && xhr && xhr.responseText) {
            try {
                var responseJSON = JSON.parse(xhr.responseText);
                result.responseText = responseJSON.Message;
                result.internalCode = responseJSON.InternalCode;
            } catch (e) { /*The result may not be json which is fine in some cases*/ }
        }
        else if ((xhr && xhr.status < 500 && (xhr.status >= 403 || xhr.status == 0)) || ajaxOptions == "timeout") //this is a timeout of some type (the call was aborted or the jquery timeout has passed etc.
            result.responseText = localize('ServiceNotAvailableError');
        else if (thrownError)
            result.responseText = thrownError; //With http/2 this will be a really general message nevertheless I will show it because the user of this code should set json accept type to their request
        if (!ignoreErrors)
            showError(result);
        return result;
    };

    export function showError(errorObject) {
        var msg = "";
        if ($.isArray(errorObject)) {

            for (var i = 0; i < errorObject.length - 1; i++) {
                msg += errorObject[i].responseText + "\n";
            }

            msg += errorObject[errorObject.length - 1].responseText;
        }
        else if (errorObject && errorObject.error) {
            msg = errorObject.responseText;
        }

        if (msg)
            toastr.error('', msg);
    };
}