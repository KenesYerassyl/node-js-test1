const addActionButton = document.querySelector(".add-action-button");
const actionTextField = document.querySelector(".action-text-field");
const actionList = document.querySelector(".action-list");

addActionButton.addEventListener("click", addAction);

actionTextField.addEventListener("keyup", addAction);

let actionArray = [];

fetchActionArray();

async function fetchActionArray() {
    let response = await fetch("http://127.0.0.1:3000/actions/Yerassyl");
    actionArray = await response.json();
    renderArray();
}

async function uploadAction(action) {
    const params = {
        headers : {
            "Content-Type" : "application/json; charset=UTF-8"           
        },
        body : JSON.stringify({
            "action" : action, 
            "username" : "Yerassyl"
        }),
        method : "POST"
    };
    let response = await fetch("http://127.0.0.1:3000/add-action", params);
    if (response.status === 200) {
        const body = await response.json()
        return body.todo_id
    } else {
        return null
    }
}

async function unloadAction(todo_id) {
    const params = {
        headers : {
            "Content-Type" : "application/json; charset=UTF-8"           
        },
        body : JSON.stringify({
            "todo_id" : todo_id,
            "username" : "Yerassyl"
        }),
        method : "DELETE"
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
    let result = await uploadAction(action)
    if (result) {
        actionArray.push({
            "todo_id" : result,
            "username" : "Yerassyl",
            "content" : action
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
    const element = document.createElement("li");
    element.textContent = action.content;
    element.className = "list-group-item";

    const button = document.createElement("button");
    button.className = "delete-action-button";
    button.textContent = "X";
    button.dataset.todo_id = action.todo_id;
    button.addEventListener("click", deleteAction);

    element.appendChild(button);
    actionList.appendChild(element);
  });
}
