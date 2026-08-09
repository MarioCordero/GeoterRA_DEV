<?php
declare(strict_types=1);

namespace Services;

use Core\EmailSenderInterface;
use Core\Logger;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Throwable;

/**
 * Implementation of EmailSenderInterface using PHPMailer and SMTP.
 *
 * Safely loads credentials from environment variables to prevent
 * exposing sensitive data in the source code.
 */
final class SmtpEmailService implements EmailSenderInterface
{
  /**
   * Sends an email to a specified recipient using configured SMTP credentials.
   *
   * @param string $to Recipient email address.
   * @param string $subject Email subject.
   * @param string $htmlBody Email body in HTML format.
   * @return bool True if the email was sent successfully, false otherwise.
   */
  public function send(string $to, string $subject, string $htmlBody): bool
  {
    // Passing `true` enables exceptions
    $mail = new PHPMailer(true);

    try {
      // Server settings
      $mail->isSMTP();
      $mail->Host       = $this->getEnvVar('SMTP_HOST', 'smtp.gmail.com');
      $mail->SMTPAuth   = true;
      $mail->Username   = $this->getEnvVar('SMTP_USER', '');
      $mail->Password   = $this->getEnvVar('SMTP_PASS', '');
      $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
      $mail->Port       = (int) $this->getEnvVar('SMTP_PORT', '587');

      // Recipients
      $fromEmail = $this->getEnvVar('SMTP_FROM_EMAIL', 'noreply@geoterra.ucr.ac.cr');
      $fromName  = $this->getEnvVar('SMTP_FROM_NAME', 'GeoterRA');

      $mail->setFrom($fromEmail, $fromName);
      $mail->addAddress($to);

      // Content
      $mail->isHTML(true);
      $mail->CharSet = 'UTF-8';
      $mail->Subject = $subject;
      $mail->Body    = $htmlBody;

      $mail->send();
      return true;
    } catch (Exception | Throwable $e) {
      Logger::error("Failed to send email to {$to} via SMTP: " . $e->getMessage());
      return false;
    }
  }

  /**
   * Helper function to retrieve environment variables safely.
   * Checks both $_ENV and getenv() fallbacks.
   *
   * @param string $key The environment variable key.
   * @param string $default Fallback value if the key is not found.
   * @return string
   */
  private function getEnvVar(string $key, string $default): string
  {
    $value = $_ENV[$key] ?? getenv($key);
    return ($value !== false && $value !== null && $value !== '') ? (string) $value : $default;
  }
}