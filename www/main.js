/**
 * Created by Amit Abel and Golan Ben Ami
 */

var task_line =  document.getElementById("new-todo");

/* Set new to-do task */
function setTaskInHTML (div, task, i){
    var completeClass = '', // A class for complete tasks
        checkClass = '';    // A class for checked tasks

    var template
        =	'<li data-id="{{id}}" class="{{completed}}" onblur="editItemDone({{id}})">'
        +		'<div class="view">'
        +			'<input class="toggle" onclick="checkBox({{id}})" type="checkbox" {{checked}}>'
        +			'<label  ondblclick="editLabel({{id}})" >{{value}}</label>'
        +			'<button class="destroy" onclick="deleteItem({{id}})"></button>'
        +		'</div>'
        +	'</li>'; // Task template
    if (task.completed === 1){
        completeClass = 'completed';
        checkClass = 'checked';
    }
    template = template.replace(/\{\{id}}/g, task.id);
    template = template.replace(/\{\{value}}/g, task.value);
    template = template.replace('{{completed}}', completeClass);
    template = template.replace('{{checked}}', checkClass);

    div.innerHTML += (template);
}

/* Update to-do item in list */
function checkBox(id){
    var listTodo, // List of to-do items
        newStatus, // New status for to-do item
        oldStatus, // Old status for to-do item
        todoStatus, // Current status for to-do item
        value;     // Value for to-do item
    listTodo = document.querySelector('[data-id="' + id + '"]');
    if (!listTodo) {
        return;
    }
    value = listTodo.getElementsByTagName('label')[0].firstChild.data;
    oldStatus = listTodo.className;
    newStatus = oldStatus === "" ? "completed" : "";
    todoStatus = newStatus === "" ? 0 : 1;

    $.ajax({
        url: "/item",
        type: "PUT",
        data: JSON.stringify({id: id, value: value, completed: todoStatus}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (result, status, xhr) {
            listTodo.className = newStatus;
            listTodo.querySelector('input').checked = todoStatus;
            fillList();
        },
        error: function (xhr, status, error) {
            if (xhr.status === 200){
                listTodo.className = newStatus;
                listTodo.querySelector('input').checked = todoStatus;
                fillList();
            } else {
                alert("error: " + jqXHR.status + " Checking item failed. Try again.");
                activate_login()
            }
        }
    });}

/* Edit to-do item in list */
function editLabel(id){
    var input,      // new input element
        listItem,   // List of items
        title;      // item's title
    listItem = qs('[data-id="' + id + '"]');
    title = listItem.getElementsByTagName('label')[0].firstChild.data;
    if (!listItem) {
        return;
    }
    listItem.className = listItem.className + ' editing';
    input = document.createElement('input');
    input.className = 'edit';
    input.setAttribute('onblur', 'editItemDone(' +id+')');
    listItem.appendChild(input);
    input.focus();
    input.value = title;
}

/* Edit to-do item status in list */
function editItemDone(id){
    var input,      // get input element
        listItem,   // List of items
        title;      // item's title
    listItem = qs('[data-id="' + id + '"]');
    title = listItem.querySelector('input.edit').value;
    if (!listItem) {
        return;
    }
    input = qs('input.edit', listItem);
    listItem.removeChild(input);
    listItem.className = listItem.className.replace('editing', '');
    qsa('label', listItem).forEach(function (label) {
        label.textContent = title;
    });
    putItem(id, title, 0);
}

/* Fill to-do items list */
function fillList(){
    var all = document.getElementById('all'),               // All items
        completed = document.getElementById('completed'),   // Completed items
        active = document.getElementById('active');         // Active items
    all.innerHTML = "";
    completed.innerHTML = "";
    active.innerHTML = "";

    $.ajax ({
        url: "/item",
        type: "GET",
        dataType: "json",
        success: function(data, textStatus, messageBody) {
            var all_items,  // All item list
                i;          // Single item index
            if (data.toString() === '500'){
                alert("success: Loading list failed. Try again.");
                activate_login()
            }
            else {
                all_items = JSON.parse(JSON.stringify(data));
                document.getElementById('counter').innerHTML = "Number of products = " + all_items.length;
                for (i = 0; i < all_items.length; i++){
                    if (typeof all_items[i] === 'undefined') continue;
                    setTaskInHTML(all, all_items[i], i);
                    if (all_items[i].completed = 1){
                        setTaskInHTML(completed, all_items[i], i);

                    }
                    else { // The task should be in active
                        setTaskInHTML(active, all_items[i], i);
                    }
                }
            }
        },
        error: function(jqXHR,textStatus, errorThrown) {
            alert("error: " + jqXHR.status + " Loading list failed. Try again.");
            activate_login()
        }
    });
}

/* Add new to-do item to list */
function addItem(){
    var task = task_line.value; // New task title
    if (task === '')
        return;

    $.ajax ({
        url: "/item",
        type: "POST",
        data: JSON.stringify({id: 0, value: task, completed: 0}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(data, textStatus) {
            if (data.toString() === '500'){
                alert("Add Item failed");
                activate_login();
            }
            else {
                task_line.value = "";

                fillList();
            }
        },
        error: function(jqXHR,textStatus, errorThrown) {
            if (jqXHR.status === 200){
                task_line.value = "";
                fillList();
            }
            else{
                alert(jqXHR.status + " Add Item failed");
                activate_login();
            }
        }
    });
};

/* Delete to-do item from list */
function deleteItem(id){
    $.ajax({
        url: '/item',
        type: 'DELETE',
        data: JSON.stringify({id: id}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            fillList();
        },
        error: function(jqXHR,textStatus, errorThrown) {
            if (jqXHR.status === 200) {
                fillList();
            }
            else {
                alert("jqXHR.status:" + jqXHR.status + " " + errorThrown);
                activate_login();
            }
        }
    });
}

/* Update to-do item in list */
function putItem(id, value, completed){
    $.ajax({
        url: "/item",
        type: "PUT",

        data: JSON.stringify({id: id, value: value, completed: completed}),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            fillList();
        },
        error: function(jqXHR,textStatus, errorThrown) {
            if (jqXHR.status === 200) {
                fillList();
            }
            else {
                alert("jqXHR.status:" + jqXHR.status + " " + errorThrown);
                activate_login();
            }
        }
    });
}

/* Login to program */
function login(){
    var username = document.getElementById("user_name"), // User name to login
        password = document.getElementById("password"),  // User password to login
        login_user = {
            user_name: username.value,
            password: password.value
        };  // Login details object
    $.ajax ({
        url: "/login",
        type: "Get",
        data: login_user,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(data, textStatus, messageBody) {
            if (data.toString() === '500'){
                alert("Wrong login details");
            }
            else {
                fillList();
                activate_todo();
            }
        },
        error: function(jqXHR,textStatus, errorThrown) {
            if (jqXHR.status === 200){
                fillList();
                activate_todo();
            }
            else{
                alert("Wrong login details");
            }
        }
    });
}

/* Register new user to program */
function register(){
    var full_name = document.getElementById("full_name"),            // New user full name
        username = document.getElementById("reg_user_name"),         // New user username
        password = document.getElementById("reg_pass_word"),         // New user password
        ver_password = document.getElementById("ver_reg_pass_word"); // New user verify password

    $.ajax ({
        url: "/register",
        type: "POST",
        data: JSON.stringify({full_name: full_name.value, user_name:username.value,
                password:password.value, verify_password:ver_password.value}),
        dataType: "json",
        cache: false,
        contentType: "application/json; charset=utf-8",
        success: function(data, textStatus) {
            try {
                if (data.toString() === '500') {
                    alert(textStatus);
                    alert("Wrong login details");
                }
                else {
                    fillList();
                    activate_todo();
                }
            } catch (e) {
                alert("Fail");
            }
        },
        error: function(jqXHR,textStatus, errorThrown) {
            if (jqXHR.status === 200){
                fillList();
                activate_todo();
            }
            else{
                alert("Wrong login details");
            }
        }
    });
}

/* Add single item to list */
function runScript(e){
    if (e.keyCode == 13) {
        addItem();
    }
}

/* Set register window */
function activate_register(){
    document.getElementById("login").style.display = "none";
    document.getElementById("cookinapp").style.display = "none";
    document.getElementById("register").style.display = "block";
}

/* Set login window */
function activate_login(){
    document.getElementById("register").style.display = "none";
    document.getElementById("cookinapp").style.display = "none";
    document.getElementById("login").style.display = "block";
}

/* Set to-do items window */
function activate_todo(){
    document.getElementById("register").style.display = "none";
    document.getElementById("login").style.display = "none";
    document.getElementById("cookinapp").style.display = "block";
}

