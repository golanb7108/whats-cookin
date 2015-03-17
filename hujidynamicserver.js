/**
 * Created by Amit Abel and Golan Ben Ami
 */

/* All Requires */
var path = require ('path');
var fs =  require('fs');
var net =  require('net');
var hujinet = require('./hujinet');
var settings = require('./settings');


/* hujidynamicserver constructor */
var hujidynamicserver = function ()
{

    // Create the event application
    var app = function (req, res, index){
        var match; // Check if there is a match to middleware
        if (typeof index === 'undefined'){
            index = 0;
        }
        try {
            while (index < app.middleware.length){
                if (app.middleware[index].method === "USE" ||
                        app.middleware[index].method === req.method ){
                    match = does_path_match(req.path, app.middleware[index].path);
                    if (match){
                        fill_params(req, app.middleware[index].path);
                        app.middleware[index].handler(req, res, function (){
                            app(req, res, index+1);
                        });
                        return;
                    }
                }
                index += 1;
            }
            if (index === app.middleware.length) {
                res.status(404).send("The requested resource not found");
            }
        } catch (e) {
            res.status(500).send("Internal Server Error");
        }
    };
    var server = new hujinet(app); //create a new huji net server

    // Defining local vars
    app.route = {};        // Holds all of the middleware functions by method
    app.middleware = [];    // Holds all of the middleware functions

    // Stop the server
    app.stop = function (){
        server.server.close();
    };

    // USE method
    app.use = function (resource, requestHandler){
        var middle;              // the middleware that would be defined
        if (typeof requestHandler === 'undefined'){
            middle = new middleware('use', '/', resource);
        } else {
            middle = new middleware('use', resource, requestHandler);
        }
        //push to the middle ware list.
        app.middleware.push(middle);

        //push to the list by method
        if(app.route['use'] === undefined)
                app.route['use'] = [];
        app.route['use'].push(middle);
    };

    // GET method
    app.get = function (resource, requestHandler){
        var middle;              // the middleware that would be defined
        if (typeof requestHandler === 'undefined'){
            middle = new middleware('get', '/', resource);
        } else {
            middle = new middleware('get', resource, requestHandler);
        }
        //push to the middle ware list.
        app.middleware.push(middle);

        //push to the list by method
        if(app.route['get'] === undefined)
            app.route['get'] = [];
        app.route['get'].push(middle);
    };

    // POST method
    app.post = function (resource, requestHandler){
        var middle;              // the middleware that would be defined
        if (typeof requestHandler === 'undefined'){
            middle = new middleware('post', '/', resource);
        } else {
            middle = new middleware('post', resource, requestHandler);
        }
        //push to the middle ware list.
        app.middleware.push(middle);

        //push to the list by method
        if(app.route['post'] === undefined)
            app.route['post'] = [];
        app.route['post'].push(middle);
    };

    // DELETE method
    app.delete = function (resource, requestHandler){
        var middle;              // the middleware that would be defined
        if (typeof requestHandler === 'undefined'){
            middle = new middleware('delete', '/', resource);
        } else {
            middle = new middleware('delete', resource, requestHandler);
        }
        //push to the middle ware list.
        app.middleware.push(middle);

        //push to the list by method
        if(app.route['delete'] === undefined)
            app.route['delete'] = [];
        app.route['delete'].push(middle);
    };

    // PUT method
    app.put = function (resource, requestHandler){
        var middle;              // the middleware that would be defined
        if (typeof requestHandler === 'undefined'){
            middle = new middleware('put', '/', resource);
        } else {
            middle = new middleware('put', resource, requestHandler);
        }
        //push to the middle ware list.
        app.middleware.push(middle);

        //push to the list by method
        if(app.route['put'] === undefined)
            app.route['put'] = [];
        app.route['put'].push(middle);
    };

    // listen to events
    app.listen = function (port){
        server.listen(port);
    };

    return app;
};

/* Feel all params in request header */
function fill_params(request, curr_use){
    var request_params = request.path.split('/'), // List of params
        use_params = curr_use.split('/'),         // List of the use' elements
        index;                                    // Index in the list
    for (index=0; index < use_params.length; index++){
        if(use_params[index].match(/:/g)){
            request.params[use_params[index].replace(':','')] = request_params[index];
        }
    }
}

/* middleware Constructor */
function middleware(method, path, callback){
    this.method = method.toUpperCase();
    this.path = path;
    this.handler = callback;
};

/* Check if a given path match to middleware path */
function does_path_match(req_path, middleware_path){
    var reqex,              // Regular exprestion of the middle path
        midd_path_list,     // List of all middleware path elements
        theReg;             // The pattern to be checked

    midd_path_list = middleware_path.split('\/');
    if (midd_path_list.length === 0)
        return true;

    regex = "^";
    for (var i = 0; i < midd_path_list.length; i++) {
        if (midd_path_list[i] !== "") {
            regex += "\/";
            if (!(midd_path_list[i].match(/:/g))) {
                regex += midd_path_list[i];
            }
            else {
                regex += "(?:([^\/]+?))";
            }
        }
    }
    regex += '($|\/)';

    theReg = new RegExp(regex, "i");
    return req_path.match(theReg);
}

module.exports = hujidynamicserver;