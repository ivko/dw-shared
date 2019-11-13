function getCookieValue(cookieName, searchForProperty) {
  var cookieProperty = null;
  var globalCookieObj = document.cookie //reference to global cookie object

  if (globalCookieObj == undefined || globalCookieObj == null)
    return cookieProperty;  //there are no cookies

  var allCookiesArr = globalCookieObj.split(";")
  $(allCookiesArr).each(function (i, el) {
    var cookieStr = jQuery.trim(el);

    //lookup for cookie with specified name
    if (cookieStr.substring(0, cookieStr.indexOf("=")).toLowerCase() == cookieName.toLowerCase()) {
      //if no searchForProperty is specified, user want whole content of cookie. So let's pass back...
      if (searchForProperty == null || searchForProperty == undefined || searchForProperty == "") {
        cookieProperty = cookieStr.substring(cookieStr.indexOf("=") + 1);
        return;
      }

      //lookup for property
      var indexOfLookupProperty = cookieStr.toLowerCase().indexOf(searchForProperty.toLowerCase());
      if (indexOfLookupProperty > -1) {
        var indexOfNextSeperator = cookieStr.substring(indexOfLookupProperty).indexOf("&");
        cookieProperty = cookieStr.substring(indexOfLookupProperty + searchForProperty.length + 1, indexOfLookupProperty + indexOfNextSeperator)

        return;
      }
    }
  })

  return cookieProperty;
}