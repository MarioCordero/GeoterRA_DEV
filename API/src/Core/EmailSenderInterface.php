<?php
declare(strict_types=1);

namespace Core;

/**
 * Contract for email sending services.
 *
 * Ensures different email providers can be swapped seamlessly via dependency injection.
 */
interface EmailSenderInterface
{
  /**
   * Sends an email to a specified recipient.
   *
   * @param string $to Recipient email address.
   * @param string $subject Email subject.
   * @param string $htmlBody Email body in HTML format.
   * @return bool True if the email was sent successfully, false otherwise.
   */
  public function send(string $to, string $subject, string $htmlBody): bool;
}