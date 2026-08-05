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
   * Generates a hidden unique string to prevent Gmail thread clipping/collapsing.
   */
  private function getAntiClippingToken(): string
  {
    $id = uniqid('ref_', true);
    return "<span style='display:none !important; font-size:0px; line-height:0px; max-height:0px; opacity:0; overflow:hidden;'>[Ref: {$id}]</span>";
  }

  /**
   * Sends a new login notification email to the user with device and location context.
   */
  public function notifyNewLogin(
    string $email,
    string $firstName,
    string $device,
    string $location,
    string $time
  ): void {
    $subject = "Alerta de Seguridad: Nuevo inicio de sesión";
    $antiClip = $this->getAntiClippingToken();

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName}</h2>
          
          <p style='line-height: 1.5;'>
            Hemos identificado un nuevo <strong>inicio de sesión</strong> en la app <strong>GeoterRA</strong> y queremos verificar que sea usted.
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <table style='width: 100%; text-align: left; border-collapse: collapse; font-size: 14px; table-layout: fixed;'>
              <tr>
                <th style='padding-bottom: 10px; border-bottom: 1px solid #dddddd; width: 33%;'>Dispositivo</th>
                <th style='padding-bottom: 10px; border-bottom: 1px solid #dddddd; width: 33%;'>Lugar</th>
                <th style='padding-bottom: 10px; border-bottom: 1px solid #dddddd; width: 34%;'>Hora</th>
              </tr>
              <tr>
                <td style='padding-top: 10px; word-break: break-word; vertical-align: top;'>{$device}</td>
                <td style='padding-top: 10px; word-break: break-word; vertical-align: top;'>{$location}</td>
                <td style='padding-top: 10px; word-break: break-word; vertical-align: top;'>{$time}</td>
              </tr>
            </table>
          </div>

          <p style='line-height: 1.5; color: #666666;'>
            Si fue usted, haga caso omiso de este mensaje.
          </p>
        </div>

        <div style='background-color: #f4f4f4; padding: 25px 20px; margin-top: 10px;'>
          <h3 style='margin-top: 0; font-size: 16px;'>¿No fue usted?</h3>
          <p style='line-height: 1.5; font-size: 14px;'>
            En caso de no reconocer este inicio de <strong>sesión</strong>, le recomendamos cambiar su contraseña de inmediato mediante los siguientes pasos:
          </p>
          <ol style='line-height: 1.6; font-size: 14px; padding-left: 20px;'>
            <li>Inicie <strong>sesión</strong> en el sistema desde la página web con una computadora o en la app móvil desde su celular.</li>
            <li>Vaya a la sección de Cuenta e ingrese a la sección de Configuraciones/Seguridad.</li>
            <li>Seleccione la opción: Cambiar Contraseña.</li>
          </ol>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends a password reset notification containing a secure OTP token.
   */
  public function notifyPasswordReset(
    string $email,
    string $firstName,
    string $token
  ): void {
    $subject = "Alerta de Seguridad: Código de Recuperación de Contraseña";
    $antiClip = $this->getAntiClippingToken();

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName}!,</h2>
          
          <p style='line-height: 1.5;'>
            Hemos recibido una solicitud de <strong>recuperación de contraseña</strong> de su cuenta. Por favor, utilice el siguiente <strong>código OTP</strong> para completar el proceso de recuperación:            
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; text-align: center; border-radius: 8px;'>
            <span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #F19B29;'>{$token}</span>
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Este código expirará en <strong>5 minutos.</strong> Si usted no solicitó la recuperación de contraseña, por favor ignore este correo o cambie su contraseña actual en caso de ser necesario.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends an email notification when a new investigation request is successfully created.
   */
  public function notifyRequestCreated(
    string $email,
    string $firstName,
    string $requestName,
    string $time
  ): void {
    $subject = "Confirmación: Nueva Solicitud Creada";
    $antiClip = $this->getAntiClippingToken();

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le confirmamos que su solicitud ha sido creada exitosamente en nuestro sistema.
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <p style='margin: 0 0 10px 0; font-size: 16px; word-break: break-word;'><strong>Solicitud:</strong> <span style='color: #F19B29; font-weight: bold;'>{$requestName}</span></p>
            <p style='margin: 0; font-size: 14px; color: #555555;'><strong>Fecha de registro:</strong> {$time}</p>
          </div>

          <p style='line-height: 1.5; color: #666666;'>
            Nuestro equipo técnico revisará la información y le notificaremos cuando haya una actualización en el estado de su solicitud.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends an email notification when an investigation request is updated by the owner.
   */
  public function notifyRequestUpdated(
    string $email,
    string $firstName,
    string $requestName,
    string $time
  ): void {
    $subject = "Actualización de Solicitud de Investigación Exitosa";
    $antiClip = $this->getAntiClippingToken();

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le informamos que la información de su solicitud de inesvtigación ha sido actualizada correctamente.
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <p style='margin: 0 0 10px 0; font-size: 16px; word-break: break-word;'><strong>Solicitud:</strong> <span style='color: #F19B29; font-weight: bold;'>{$requestName}</span></p>
            <p style='margin: 0; font-size: 14px; color: #555555;'><strong>Fecha de modificación:</strong> {$time}</p>
          </div>

          <p style='line-height: 1.5; color: #666666;'>
            Puede revisar los detalles de su solicitud ingresando a su cuenta en el sistema.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends an email notification when an administrator assigns a new state to a request.
   */
  public function notifyRequestStateChanged(
    string $email,
    string $firstName,
    string $requestName,
    string $newState,
    string $description,
    string $time
  ): void {
    $subject = "Cambio de Estado en Solicitud de Investigación";
    $antiClip = $this->getAntiClippingToken();

    $descHtml = !empty($description)
      ? "<p style='margin: 15px 0 0 0; font-size: 14px; line-height: 1.5; color: #333333; border-top: 1px solid #e0e0e0; padding-top: 12px; word-break: break-word;'><strong>Comentarios del administrador:</strong><br>" . nl2br(htmlspecialchars($description, ENT_QUOTES, 'UTF-8')) . "</p>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le notificamos que el equipo técnico ha registrado un cambio en el proceso de su solicitud <strong>{$requestName}</strong>.
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <p style='margin: 0 0 10px 0; font-size: 16px; word-break: break-word;'><strong>Nuevo Estado:</strong> <span style='color: #F19B29; font-weight: bold;'>{$newState}</span></p>
            <p style='margin: 0; font-size: 14px; color: #555555;'><strong>Fecha:</strong> {$time}</p>
            {$descHtml}
          </div>

          <p style='line-height: 1.5; color: #666666;'>
            Para más información, por favor acceda a su cuenta para visualizar los detalles del avance de su solicitud.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }
}