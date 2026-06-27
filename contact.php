<?php
mb_language("Japanese");
mb_internal_encoding("UTF-8");

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// 環境変数をロード
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();
$dotenv->required(['GMAIL_ADDRESS', 'GMAIL_PASSWORD']);

$recipient = '21010408@anabuki-college.ac.jp';
$subject = 'お問い合わせフォームからの送信';
$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $company = trim($_POST['company'] ?? '');
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $tel = trim($_POST['tel'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if ($name === '' || $email === '' || $message === '') {
        $error = 'お名前、メールアドレス、お問い合わせ内容は必須です。';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = '正しいメールアドレスをご入力ください。';
    } else {
        $body = "お問い合わせを受け付けました。\n\n";
        $body .= "会社名: {$company}\n";
        $body .= "お名前: {$name}\n";
        $body .= "メールアドレス: {$email}\n";
        $body .= "電話番号: {$tel}\n\n";
        $body .= "お問い合わせ内容:\n{$message}\n";

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['GMAIL_ADDRESS'];
            $mail->Password   = $_ENV['GMAIL_PASSWORD'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;
            $mail->CharSet    = 'UTF-8';
            $mail->setFrom($_ENV['GMAIL_ADDRESS'], '吉源商事お問い合わせ');
            $mail->addAddress($recipient);
            $mail->addReplyTo($email, $name);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = $body;

            $mail->send();
            $success = true;
        } catch (Exception $e) {
            $error = 'メールの送信に失敗しました。Googleの認証で拒否されている可能性があります。Gmailで2段階認証を有効にしている場合は、Googleアカウントの「アプリパスワード」を使用してください。';
            if (!empty($mail->ErrorInfo)) {
                $error .= ' 詳細: ' . h($mail->ErrorInfo);
            }
        }
    }
}

function h($value) {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>問い合わせ｜吉源商事</title>
    <meta name="description" content="金属スクラップの買取相談はこちらからお問い合わせください。">
    <script src="js/include.js"></script>
</head>
<body>
<header class="site-header sticky-top">
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.html">株式会社　吉源商事</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#globalNav" aria-controls="globalNav" aria-expanded="false" aria-label="メニューを開く">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="globalNav">
                <ul class="navbar-nav ms-auto gap-lg-2">
                    <li class="nav-item"><a class="nav-link" href="index.html">トップ</a></li>
                    <li class="nav-item"><a class="nav-link" href="company.html">会社紹介</a></li>
                    <li class="nav-item"><a class="nav-link" href="business.html">事業内容</a></li>
                    <li class="nav-item"><a class="nav-link active" aria-current="page" href="contact.html">問い合わせ</a></li>
                </ul>
            </div>
        </div>
    </nav>
</header>

<main>
    <section class="page-title">
        <div class="container">
            <h1 class="fw-bold">問い合わせ</h1>
            <p class="lead mb-0">金属スクラップの買取相談はこちらからお問い合わせください。</p>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="row g-5">
                <div class="col-lg-5">
                    <h2 class="section-title">お問い合わせ先</h2>
                    <p>電話またはメールでご連絡ください。</p>
                    <div class="contact-info">
                        <p><strong>TEL：</strong>090-8736-8666</p>
                        <p><strong>Mail：</strong>yoshigensyouji@gmail.com</p>
                        <p><strong>受付時間：</strong>平日 9:00〜18:00</p>
                    </div>
                </div>
                <div class="col-lg-7">
                    <?php if ($success): ?>
                        <div class="alert alert-success" role="alert">
                            お問い合わせ内容を送信しました。返信は入力されたメールアドレス宛に行います。
                        </div>
                    <?php elseif ($error): ?>
                        <div class="alert alert-danger" role="alert">
                            <?php echo h($error); ?>
                        </div>
                    <?php endif; ?>

                    <form class="contact-form" action="contact.php" method="post">
                        <div class="mb-3">
                            <label class="form-label" for="company">会社名</label>
                            <input class="form-control" id="company" type="text" name="company" value="<?php echo h($company ?? ''); ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="name">お名前</label>
                            <input class="form-control" id="name" type="text" name="name" required value="<?php echo h($name ?? ''); ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="email">メールアドレス</label>
                            <input class="form-control" id="email" type="email" name="email" required value="<?php echo h($email ?? ''); ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="tel">電話番号</label>
                            <input class="form-control" id="tel" type="tel" name="tel" value="<?php echo h($tel ?? ''); ?>">
                        </div>
                        <div class="mb-4">
                            <label class="form-label" for="message">お問い合わせ内容</label>
                            <textarea class="form-control" id="message" name="message" rows="6" required><?php echo h($message ?? ''); ?></textarea>
                        </div>
                        <button class="btn btn-danger btn-lg" type="submit">送信する</button>
                    </form>
                </div>
            </div>
        </div>
    </section>
</main>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/main.js"></script>
</body>
</html>
