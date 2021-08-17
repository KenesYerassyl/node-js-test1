const addActionButton = document.querySelector(".add-action-button");
const actionTextField = document.querySelector(".action-text-field");
const actionList = document.querySelector(".action-list");
const logOutButton = document.querySelector(".log-out");

addActionButton.addEventListener("click", addAction);

actionTextField.addEventListener("keyup", addAction);

logOutButton.addEventListener("click", logOut);

let actionArray = [];

fetchActionArray();

async function fetchActionArray() {
    let response = await fetch("http://127.0.0.1:3000/actions");
    actionArray = await response.json();
    renderArray();
}

async function uploadAction(action) {
    const params = {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            action: action,
        }),
        method: "POST",
    };
    let response = await fetch("http://127.0.0.1:3000/add-action", params);
    if (response.status === 200) {
        const body = await response.json();
        return body.todo_id;
    } else {
        return null;
    }
}

async function unloadAction(todo_id) {
    const params = {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            todo_id: todo_id,
        }),
        method: "DELETE",
    };
    let response = await fetch("http://127.0.0.1:3000/delete-action", params);
    return response.status === 200;
}

async function addAction(event) {
    const action = actionTextField.value;
    if (action.length !== 0) {
        if (event.type === "keyup" && event.keyCode !== 13) {
            return;
        }
        let result = await uploadAction(action);
        if (result) {
            actionArray.push({
                todo_id: result,
                content: action,
            });
            renderArray();
        }
        actionTextField.value = "";
    }
}

async function deleteAction(event) {
    const todo_id = event.currentTarget.dataset.todo_id;
    if (await unloadAction(todo_id)) {
        actionArray = actionArray.filter(function (item) {
            return item.todo_id !== todo_id;
        });
        renderArray();
    }
}

function renderArray() {
    actionList.innerHTML = "";
    actionArray.forEach((action) => {
        const html = `
        <div class="form-check"> 
            <label class="form-check-label"> 
                <input class="checkbox" type="checkbox">${action.content}<i class="input-helper"></i>
            </label> 
        </div> 
        <svg class="remove mdi mdi-close-circle-outline" data-todo_id=${action.todo_id} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 9L9 15" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 9L15 15" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `;
        const element = document.createElement("li");
        element.innerHTML = html;
        element.className = "list-group-item";
        actionList.appendChild(element);
    });
    const removeIcons = document.querySelectorAll(".remove");
    removeIcons.forEach((icon) => {
        icon.addEventListener("click", deleteAction);
    });
}

async function logOut() {
    const params = {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        credentials: "include",
        method: "DELETE",
    };
    let response = await fetch("http://127.0.0.1:3000/", params);
    if (response.status === 200) {
        window.location.pathname = "/register";
    }
}
