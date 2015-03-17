/**
 * Created by Amit Abel and Golan Ben Ami
 */

/* All Requires */
var settings = require('./settings');

/* HttpRequest constructor */
var HttpRequest = function (){
    this.method = null;
    this.url = null;
    this.protocol = null;
    this.http_ver = null;
    this.headers = {};
    this.params = {};
    this.query = {};
    this.cookies = {};
    this.path = null;
    this.host = null;
    this.body = null;
    this.body_params = {};

    // Return the value of param name when present.
    this.param = function (name, defaultValue) {
        if (settings.find_key_in_list(name,this.params)){
            return this.params[settings.find_key_in_list(name,this.params)];
        } else if (settings.find_key_in_list(name,this.body_params)){
            return this.body_params[settings.find_key_in_list(name,this.body_params)];
        } else if (settings.find_key_in_list(name,this.query)){
            return this.query[settings.find_key_in_list(name,this.query)];
        } else if (defaultValue){
            return defaultValue;
        } else {
            throw settings.invalid_value_error;
        }
    };

    // Get the case-insensitive request header field.
    // The Referrer and Referer fields are interchangeable.
    this.get = function (field){
        if (settings.find_key_in_list(field,this.headers)){
            return this.headers[settings.find_key_in_list(field,this.headers)];
        }
        return "";
    };

    // Check if the incoming request contains the "Content-Type" header field,
    // and if it matches the give mime type.
    this.is = function (type){
        var req_type = this.get(settings.BODY_TYPE_HEADER), // The request body's type
            patt = new RegExp(type);                        // Pattern for type
        return patt.test(req_type);
    };
};

/* HttpRequest print */
HttpRequest.prototype.print = function (){
    console.log(this.method);
    console.log(this.url);
    console.log(this.protocol);
    console.log(this.http_ver);
    console.log(this.headers);
    console.log(this.params);
    console.log(this.query);
    console.log(this.cookies);
    console.log(this.path);
    console.log(this.host);
    console.log(this.body);
    console.log(this.body_params);
};

exports.HttpRequest = HttpRequest;
