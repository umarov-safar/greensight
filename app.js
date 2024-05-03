const form = document.getElementById("register-form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    let formData = new FormData(form);
    formData = Object.fromEntries(formData);
    clearNotifiedErrors(formData);

    if (validateRequest(formData)) {
        sendRequest(formData);
    }
});

const sendRequest = (formData) => {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'server.php');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
            onSuccess(JSON.parse(xhr.responseText))
        } else if (xhr.status === 401) {
            onInvalidRequest(JSON.parse(xhr.responseText));
        }
    }
    xhr.onerror = function() {
        alert(`Ошибка соединения`);
    };
    xhr.send(JSON.stringify(formData));
}

const onSuccess = (data) => {
    let cardBody = document.getElementById('card-body');
    cardBody.innerHTML = `<h1>Вы успешно зарегистрировались ${data.data.name}!</h1>`;
}

const onInvalidRequest = (data) => {
    if (data?.errors) {
        notifyValidationErrors(data.errors);
    }
}

// Basic validation.
const validateRequest = (data) => {
    // this contains all feiled fields
    const errors = {};

    if (data.name.length === 0) {
        errors.name = "Это поле обязательно для заполнения!";
    }
    if (data.last_name.length === 2) {
        errors.last_name = "Это поле обязательно для заполнения!"
    }
    // Here is a simple validation for email. The advance validation will be in server
    if (! data.email.includes('@')) {
        errors.email = "Неправильный формат!"
    }
    if (data.password.length >= 4) {
        if (data.password !== data.confirmation_password) {
            errors.confirmation_password = "Пароль не совпадает!"
        }
    } else {
        errors.password = "Пароль должно быть больше 4 символа!"
    }

    if (!isObjectEmpty(errors)) {
        notifyValidationErrors(errors);
        return false;
    }

    return true;
}

const notifyValidationErrors = (errors) => {
    const iterableErrors = Object.entries(errors);
    iterableErrors.forEach(([name, message]) => {
        document.querySelector(`#error_${name}`).innerText = message;
    })
}

const clearNotifiedErrors = (formData) => {
    const fields = Object.keys(formData);
    fields.forEach((field) => {
        document.querySelector(`#error_${field  }`).innerText = '';
    })
}

const isObjectEmpty = (objectName) => {
    return Object.keys(objectName).length === 0
}