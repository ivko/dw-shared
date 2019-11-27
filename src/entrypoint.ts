// A custom entry-point for webpack. 
// This is designed to set the publicPath dynamically under production build.
declare let  __webpack_public_path__:string; 

const dwsharedBaseUrl = '__dwshared_baseUrl__';
__webpack_public_path__ = window[dwsharedBaseUrl] as string;