/**
 * Created by Amit Abel and Golan Ben Ami
 */

/* All Requires */
var httpresponse = require('./httpresponse');
var hujiparser = require('./hujiparser');
var settings = require('./settings');
var net = require('net');
var types = require('./mimetypes');
var util = require('util');
var event = require('events').EventEmitter;
var url = require('url');



/* Check if the socket has to be closed after http request */
function check_close(http_req){
    if (settings.find_key_in_list("Connection", http_req.headers) &&
            http_req.headers[settings.find_key_in_list
            ("Connection", http_req.headers)].toLowerCase() === "close"){
        return true;
    }
    if ((http_req.http_ver === '1.0') &&
            (settings.find_key_in_list("Connection", http_req.headers) &&
            http_req.headers[settings.find_key_in_list("Connection", http_req.headers)].toLowerCase()
            !== "keep-alive")){
        return true;
    }
    return false;
}

function send_error(socket, req){
    var resp = new httpresponse.HttpResponse(socket, false); // The error response
    resp.set('Connection', req.headers[settings.find_key_in_list("Connection",req.headers)]);
    resp.http_ver = req.http_ver;
    resp.status(500).send();
}

/* Create new server on port */
var hujinet = function (handler){
    var myhujinet = this; // husinet server
    myhujinet.server = net.createServer(function (socket){ //'connection' listener
        socket.setTimeout(2000);
        socket.on('data', function (data){
            var i,                                            // Index in the list
                req_list = hujiparser.parse(data.toString()), // List of requests
                resp;                                         // The new response
            for (i = 0; i < req_list.length ; i++){
                if (!req_list[i].method){
                    send_error(socket, req_list[i]);
                }
                else{
                    resp = new httpresponse.HttpResponse(socket, check_close(req_list[i]));
                    resp.set('Connection', req_list[i].headers[settings.find_key_in_list
                            ("Connection",req_list[i].headers)]);
                    resp.http_ver = req_list[i].http_ver;
                    myhujinet.emit('request', req_list[i], resp);
                }
            }
        });

        socket.on('timeout', function (){
            socket.end();
            socket.destroy();
        });

        socket.on('error', console.log);
    });

    myhujinet.server.on('error', console.log);

    myhujinet.on('request', function (req, res) {
        handler(req, res);
    });

    myhujinet.listen = function (port){
        myhujinet.server.listen(port);
    };

    myhujinet.close = function (){
        myhujinet.server.close();
        myhujinet.emit('close');
    };
    event.call(myhujinet);
    return myhujinet;
};

util.inherits(hujinet, event);
module.exports = hujinet;