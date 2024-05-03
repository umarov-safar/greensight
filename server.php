<?php

header("Content-Type: application/json");

$data = json_decode(file_get_contents('php://input'), true);

[$isValidRequest, $errors] = checkValidation($data);

if ($isValidRequest) {
    unset($data['password'], $data['confirmation_password']);
    printResponse(['data' => $data]);
    logger('Успешной проверки!');
} else {
    printResponse($errors, 401);
    logger('Не успешной проверки!');
}

function printResponse(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT);
}

function checkValidation(array $data): array {
    $users = require_once './users.php';
    $errors = [];

    if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['errors']['email'] = 'Ошибка в поле email';
    }

    if (in_array($data['email'], array_column($users, 'email'))) {
        $errors['errors']['email'] = sprintf('%s уже добавлено!', $data['email']);
    }

    if (isset($data['password']) && (strlen($data['password']) > 3)) {
        if ($data['password'] !== ($data['confirmation_password'] ?? null)) {
            $errors['errors']['confirmation_password'] = 'Пароль не совпадает!';
        }
    } else {
        $errors['errors']['password'] = 'Ошибко в пароле!';
    }

    if (count($errors) > 0) {
        return [false, $errors];
    }

    return [true, $errors];
}

function logger(string $stream): void {
    $file = fopen('log.txt', 'a');
    fwrite($file, $stream . PHP_EOL);
    fclose($file);
}