const addActionButton = document.querySelector(".add-action-button");
const actionTextField = document.querySelector(".action-text-field");
const actionList = document.querySelector(".action-list");

addActionButton.addEventListener("click", addAction);

actionTextField.addEventListener("keyup", addAction);

let actionArray = [];

fetchActionArray();

async function fetchActionArray() {
    let response = await fetch("http://127.0.0.1:3000/actions");
    actionArray = await response.json();
    renderArray();
}

async function uploadAction(action) {
    const params = {
        headers : {
            "Content-Type" : "application/json; charset=UTF-8"           
        },
        body : action,
        method : "POST"
    };
    let response = await fetch("http://127.0.0.1:3000/add-action", params);
    return response.status === 200;
}

async function unloadAction(action) {
    const params = {
        headers : {
            "Content-Type" : "application/json; charset=UTF-8"           
        },
        body : action,
        method : "DELETE"
    };
    let response = await fetch("http://127.0.0.1:3000/delete-action", params);
    return response.status === 200;
}

function addAction(event) {
  const action = actionTextField.value;
  if (action.length !== 0) {
    if (event.type === "keyup" && event.keyCode !== 13) {
      return;
    }
    if (uploadAction(action)) {
        actionArray.push(action);
        renderArray();
    }
    actionTextField.value = "";
  }
}

function deleteAction(event) {
    const action = event.currentTarget.dataset.action;
    if (unloadAction(action)) {
        actionArray = actionArray.filter(function (item) {
            return item !== action;
        });
        renderArray();
    }
}

function renderArray() {
  actionList.innerHTML = "";
  actionArray.forEach((action) => {
    const element = document.createElement("li");
    element.textContent = action;
    element.className = "list-group-item";

    const button = document.createElement("button");
    button.className = "delete-action-button";
    button.textContent = "X";
    button.dataset.action = action;
    button.addEventListener("click", deleteAction);

    element.appendChild(button);
    actionList.appendChild(element);
  });
}
