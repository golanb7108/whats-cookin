/**
 * Created by Amit Abel and Golan Ben Ami
 */

/* All Requires */
var settings = require('./settings');

exports.bad_item_params_error = new Error("The item params are wrong. Please insert new parameters");

var todo_items = []; // A list of lists of all to-do items for a user

/* To-do item object */
var Item = function (task){
    this.task = task;
    this.completed = settings.ACTIVE_TASK;
};

/* Add new user's to-do items list */
function new_user_todo_list(user_name){
    if (user_name === undefined){
        throw settings.invalid_value_error;
    }
    todo_items[user_name] = {};
}

/* Get to-do item list for a user */
function get_item_by_user(user_name){
    if ((user_name === undefined) || (todo_items[user_name] === undefined)){
        throw settings.invalid_value_error;
    }
    return todo_items[user_name];
}

/* Add new item to user to-do list of items */
function add_item_to_user(user_name, item_task){
    if ((user_name === undefined) || (item_task === undefined) || (todo_items[user_name] === undefined)){
        throw settings.invalid_value_error;
    }
    todo_items[user_name][Object.keys(todo_items[user_name]).length] = new Item(item_task);
}

/* Update item information for user */
function update_item_for_user(user_name, item_id, item_task, item_status){
    if ((user_name === undefined) || (todo_items[user_name] === undefined)){
        throw settings.invalid_value_error;
    } else if (todo_items[user_name][item_id] === undefined){
        throw this.bad_item_params_error;
    }
    if (item_task !== undefined){
        todo_items[user_name][item_id].task = item_task;
    }
    if (item_status !== undefined){
        todo_items[user_name][item_id].completed = item_status;
    }
}

/* Delete a item from user to-do list */
function delete_item_for_user(user_name, item_id){
    var index_id, // index of single item
        item_length; // total number of items for user
    if ((user_name === undefined) || (todo_items[user_name] === undefined)){
        throw settings.invalid_value_error;
    }  else if (todo_items[user_name][item_id] === undefined){
        throw this.bad_item_params_error;
    } else {
        item_length = Object.keys(todo_items[user_name]).length;
        for (index_id = item_id; index_id < item_length-1; index_id++){
            todo_items[user_name][index_id] = todo_items[user_name][index_id+1];
        }
        delete todo_items[user_name][item_length-1];
    }
}

/* Delete all items from user to-do list */
function delete_all_items_for_user(user_name){
    var index_id = 0; // index of single item
    if ((user_name === undefined) || (todo_items[user_name] === undefined)){
        throw settings.invalid_value_error;
    }
    while (todo_items[user_name][index_id]){
        if (todo_items[user_name][index_id].completed === settings.COMPLETED_TASK){
            delete_item_for_user(user_name, index_id);
        }
        else {
            index_id += 1;
        }
    }
}

exports.new_user_todo_list = new_user_todo_list;
exports.get_item_by_user = get_item_by_user;
exports.add_item_to_user = add_item_to_user;
exports.update_item_for_user = update_item_for_user;
exports.delete_item_for_user = delete_item_for_user;
exports.delete_all_items_for_user = delete_all_items_for_user;