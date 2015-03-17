/**
 * Created by Amit Abel and Golan Ben Ami
 */

/* All Requires */
var settings = require('./settings');
var todoitems = require('./todoitems');
var users = require('./users');
var uuid = require('node-uuid');
var hujiserver = require('./hujiwebserver');
var parser = require('./hujiparser');

/* Server variables */
var port = 8124;

/* Open new hujiwebserver, define handlers and listen to new requests */
hujiserver.start(port,function (e, server){
    e ? (console.log(e)) : (console.log('server is up'));
    if (typeof server !== 'undefined'){
        console.log("server start");

        server.post('/register', register);
        server.get('/login', login);

        server.get('/item', get_all_todo_items);
        server.post('/item', add_item_to_todo_items);
        server.put('/item', update_item_in_todo_items);
        server.delete('/item', delete_item_in_todo_items);

        server.use('/', hujiserver.static('/www'));

    }
});

/* Register new user */
function register(request, response, next){
    var session_id, // User's session id
        user_name;  // User's name
    try {
        parser.body_parser(request);
        if (request.body_params === undefined){
            throw settings.bad_request_format_error;
        }
        session_id = uuid.v1();
        user_name = request.param('user_name');
        users.add_user(user_name,request.param('full_name'),request.param('password'),
                request.param('verify_password'),session_id);
        todoitems.new_user_todo_list(user_name);
        response.cookie('user_name', user_name,
                {'expires':users.get_user_by_name(user_name).time_to_expire});
        response.cookie('sessionId', session_id,
                {'expires':users.get_user_by_name(user_name).time_to_expire});
        response.status(200).send(settings.STATUS_PHRASES[200]);
    } catch (e) {
        response.status(500).send(e.message);
        return settings.FAILURE;
    }
    return settings.SUCCESS;
}

/* Login user into program */
function login(request, response, next){
    var password,   // User's password
        session_id, // User's session id
        user_name;  // User's name
    try {
        user_name = request.param('user_name');
        password = request.param('password');
        session_id = uuid.v1();
        if (users.try_to_login(user_name, password, session_id)){
            response.cookie('user_name', user_name,
                    {'expires':users.get_user_by_name(user_name).time_to_expire});
            response.cookie('sessionId', session_id,
                    {'expires':users.get_user_by_name(user_name).time_to_expire});
            response.status(200).send(settings.STATUS_PHRASES[200]);
        }
    } catch (e) {
        response.status(500).send(e.message);
        return settings.FAILURE;
    }
    return settings.SUCCESS;
}

/* Return a list of all to-do items for user */
function get_all_todo_items(request, response, next){
    var items = [], // User's to-do items list
        session_id, // User's session id
        task_id,    // an to-do item in the item list
        user_name;  // User's name
    try {
        user_name = request.cookies['user_name'];
        session_id = request.cookies['sessionId'];
        if ((user_name === undefined) || (session_id === undefined)){
            throw settings.bad_request_format_error;
        }
        if (users.check_user_valid(user_name, session_id)){
            for (task_id in Object.keys(todoitems.get_item_by_user(user_name))){
                items[task_id] = {};
                items[task_id]['id'] = task_id;
                items[task_id]['value'] = todoitems.get_item_by_user(user_name)[task_id].task;
                items[task_id]['completed'] =
                        todoitems.get_item_by_user(user_name)[task_id].completed;
            }
            response.status(200).json(items);
        }
    } catch (e) {
        response.status(500).send(e.message);
    }
}

/* Add new to-do item to the to-do list for a user */
function add_item_to_todo_items(request, response, next){
    var session_id, // User's session id
        task_value, // User's new to-do item value
        user_name;  // User's name
    try {
        parser.body_parser(request)
        user_name = request.cookies['user_name'];
        session_id = request.cookies['sessionId'];
        task_value = request.param('value');
        if ((user_name === undefined) || (session_id === undefined) || (task_value === undefined)){
            throw settings.bad_request_format_error;
        }
        if (users.check_user_valid(user_name, session_id)){
            todoitems.add_item_to_user(user_name, task_value);
            response.status(200).send(settings.STATUS_PHRASES[200]);
        }
    } catch (e) {
        response.status(500).send(e.message);
        return settings.FAILURE;
    }
    return settings.SUCCESS;
}

/* Update a to-do item parameters in the to-do list of a user */
function update_item_in_todo_items(request, response, next){
    var session_id, // User's session id
        task_id,    // User's to-do item id to update
        task_value, // User's to-do item value to update
        task_status, // User's to-do item status to update
        user_name;  // User's name
    try {
        parser.body_parser(request)
        user_name = request.cookies['user_name'];
        session_id = request.cookies['sessionId'];
        task_id = parseInt(request.param('id'));
        task_value = request.param('value');
        task_status = request.param('completed');
        if ((user_name === undefined) || (session_id === undefined) || (task_id === undefined)){
            throw settings.bad_request_format_error;
        }
        if (users.check_user_valid(user_name, session_id)){
            todoitems.update_item_for_user(user_name, task_id, task_value, task_status);
            response.status(200).send(settings.STATUS_PHRASES[200]);
        }
    } catch (e) {
        response.status(500).send(e.message);
        return settings.FAILURE;
    }
    return settings.SUCCESS;
}

/* Delete a to-do item from the to-do list of a user */
function delete_item_in_todo_items(request, response, next){
    var session_id, // User's session id
        task_id,    // User's to-do item id to delete
        user_name;  // User's name
    try {
        parser.body_parser(request)
        user_name = request.cookies['user_name'];
        session_id = request.cookies['sessionId'];
        task_id = parseInt(request.body_params['id']);
        if ((user_name === undefined) || (session_id === undefined) || (task_id === undefined)){
            throw settings.bad_request_format_error;
        }
        if (users.check_user_valid(user_name, session_id)){
            if (task_id === settings.DELETE_ALL_DONE){
                todoitems.delete_all_items_for_user(user_name);
            } else {
                todoitems.delete_item_for_user(user_name, task_id);
            }
            response.status(200).send(settings.STATUS_PHRASES[200]);
        }
    } catch (e) {
        response.status(500).send(e.message);
        return settings.FAILURE;
    }
    return settings.SUCCESS;
}
