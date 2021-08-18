const username = document.querySelector(".username");
const password = document.querySelector(".password");
const submitButton = document.querySelector(".submit");
const logInLink = document.querySelector(".loginhere");
const errorLabel = document.querySelector(".error-label");

submitButton.addEventListener("click", process_data);

async function process_data(event) {
    const params = {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            Accept: "application/json",
        },
        body: JSON.stringify({
            username: username.value,
            password: password.value,
        }),
        method: "POST",
    };
    const endpoint = logInLink ? "register" : "auth";
    let response = await fetch(`http://127.0.0.1:3000/${endpoint}`, params);

    if (response.status === 200) {
        window.location.pathname = "/";
    } else {
        const message = (await response.json()).message;
        errorLabel.textContent = message;
    }
}
