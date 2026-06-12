<?php
// Обработчик на контактната форма за SuperHosting (PHP mail()).
// Получава POST от /kontakt/ и пренасочва обратно с ?sent=1 или ?error=1.

declare(strict_types=1);
mb_internal_encoding('UTF-8');

const RECIPIENT  = 'office@aibuildagents.bg';
const FROM_ADDR  = 'noreply@aibuildagents.bg'; // адрес на домейна — изисква се за SPF/DKIM при SuperHosting
const REDIRECT   = '/kontakt/';

// Решение: void вместо never — съвместимост с PHP 7.4+, версията на хостинга не е гарантирана
function redirect_with(string $query): void {
    header('Location: ' . REDIRECT . '?' . $query, true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    redirect_with('error=1');
}

// Honeypot — ботовете попълват скритото поле "website"
if (!empty($_POST['website'])) {
    // Преструваме се на успех, за да не подсказваме на бота
    redirect_with('sent=1');
}

$name    = trim((string)($_POST['name'] ?? ''));
$company = trim((string)($_POST['company'] ?? ''));
$email   = trim((string)($_POST['email'] ?? ''));
$subject = trim((string)($_POST['subject'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

$subjectLabels = [
    'demo'        => 'Заявка за демо',
    'pricing'     => 'Въпрос за цени и планове',
    'app-request' => 'Запитване за конкретно приложение',
    'technical'   => 'Технически въпрос',
    'partnership' => 'Партньорство',
    'other'       => 'Друго',
];

if ($name === '' || $message === ''
    || !isset($subjectLabels[$subject])
    || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || mb_strlen($name) > 200 || mb_strlen($company) > 200 || mb_strlen($message) > 10000
) {
    redirect_with('error=1');
}

$subjectLine = '[aibuildagents.bg] ' . $subjectLabels[$subject] . ' – ' . $name;

$body = "Ново съобщение от контактната форма на aibuildagents.bg\n"
      . str_repeat('-', 50) . "\n"
      . "Имена:    {$name}\n"
      . "Компания: " . ($company !== '' ? $company : '—') . "\n"
      . "Имейл:    {$email}\n"
      . "Тема:     {$subjectLabels[$subject]}\n"
      . str_repeat('-', 50) . "\n\n"
      . $message . "\n";

$headers = [
    'From: AIBUILD AGENTS <' . FROM_ADDR . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

$ok = mail(
    RECIPIENT,
    mb_encode_mimeheader($subjectLine, 'UTF-8', 'B'),
    $body,
    implode("\r\n", $headers)
);

redirect_with($ok ? 'sent=1' : 'error=1');
