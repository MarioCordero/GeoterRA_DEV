<?php
declare(strict_types=1);

namespace Services;

use Core\EmailSenderInterface;

/**
 * Service responsible for orchestrating and composing application notifications.
 */
final class NotificationService
{
  /**
   * Constructs the NotificationService with a specific email sender implementation.
   *
   * @param EmailSenderInterface $emailSender The email sender dependency.
   */
  public function __construct(
    private readonly EmailSenderInterface $emailSender
  ) {}

  /**
   * Sends a new login notification email to the user with device and location context.
   *
   * @param string $email The user's email address.
   * @param string $firstName The user's first name.
   * @param string $device The identified device or user agent.
   * @param string $location The geographic location derived from IP.
   * @param string $time The timestamp of the login event.
   * @return void
   */
  public function notifyNewLogin(
    string $email,
    string $firstName,
    string $device,
    string $location,
    string $time
  ): void {
    $subject = "Alerta de Seguridad: Nuevo inicio de sesión";

    $body = "
      <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName}</h2>
          
          <p style='line-height: 1.5;'>
            Hemos identificado un nuevo <strong> inicio de sesión </strong> en la app <strong> GeoterRA </strong> y queremos verificar que sea usted.
          </p>

          <table style='width: 100%; margin: 30px 0; text-align: left; border-collapse: collapse; font-size: 14px;'>
            <tr>
              <th style='padding-bottom: 10px; border-bottom: 1px solid #eeeeee;'>Dispositivo</th>
              <th style='padding-bottom: 10px; border-bottom: 1px solid #eeeeee;'>Lugar</th>
              <th style='padding-bottom: 10px; border-bottom: 1px solid #eeeeee;'>Hora</th>
            </tr>
            <tr>
              <td style='padding-top: 10px;'>{$device}</td>
              <td style='padding-top: 10px;'>{$location}</td>
              <td style='padding-top: 10px;'>{$time}</td>
            </tr>
          </table>

          <p style='line-height: 1.5; color: #666666;'>
            Si fue usted, haga caso omiso de este mensaje.
          </p>
        </div>

        <div style='background-color: #f4f4f4; padding: 25px 20px; margin-top: 10px;'>
          <h3 style='margin-top: 0; font-size: 16px;'>¿No fue usted?</h3>
          <p style='line-height: 1.5; font-size: 14px;'>
            En caso de no reconocer este inicio de <strong> sesión </strong>, le recomendamos cambiar su contraseña de inmediato mediante los siguientes pasos:
          </p>
          <ol style='line-height: 1.6; font-size: 14px; padding-left: 20px;'>
            <li>Inicie <strong> sesión </strong> en el sistema desde la página web con una computadora o en la app móvil desde su celular.</li>
            <li>Vaya a la sección de Cuenta e ingrese a las sección de configuraciones/seguridad.</li>
            <li>Seleccione la opción de cambio de contraseña.</li>
          </ol>
        </div>
      </div>
    ";

    $this->emailSender->send($email, $subject, $body);
  }

  /**
   * Sends a password reset notification containing a secure OTP token.
   *
   * @param string $email The user's email address.
   * @param string $firstName The user's first name.
   * @param string $token The plain-text OTP recovery token.
   * @return void
   */
  public function notifyPasswordReset(
    string $email,
    string $firstName,
    string $token
  ): void
  {
    $subject = "Alerta de Seguridad: Código de Recuperación de Contraseña";

    $body = "
      <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName}!,</h2>
          
          <p style='line-height: 1.5;'>
            Hemos recido una solicitud de <strong> recuperación de contraseña </strong> de su cuenta. Por favor, utilice el siguiente <strong> código OTP </strong> para completar el proceso de recuperación:            
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; text-align: center; border-radius: 8px;'>
            <span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #F19B29;'>{$token}</span>
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Este código expirará en <strong> 5 minutos. </strong> Si usted no solicitó la recuperación de contraseña, por favor ignore este correo o cambie su contraseña actual en caso de ser necesario.
          </p>
        </div>
      </div>
    ";

    $this->emailSender->send($email, $subject, $body);
  }
}