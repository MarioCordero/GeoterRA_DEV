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
   * Sends an email notification when a user's role is updated by an
   * administrator or manteinance.
   */
  public function notifyRoleUpdated(
    string $email,
    string $firstName,
    string $newRole,
    string $time
  ): void {
    $subject = "Actualización de Cuenta: Nuevo Rol Asignado";
    $antiClip = $this->getAntiClippingToken();

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le informamos que el equipo técnico ha modificado los permisos de su cuenta y se le ha asignado un nuevo <strong>rol</strong> en el sistema.
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <p style='margin: 0 0 10px 0; font-size: 16px; word-break: break-word;'><strong>Nuevo Rol Asignado:</strong> <span style='color: #F19B29; font-weight: bold;'>{$newRole}</span></p>
            <p style='margin: 0; font-size: 14px; color: #555555;'><strong>Fecha de modificación:</strong> {$time}</p>
          </div>

          <p style='line-height: 1.5; color: #666666;'>
            Los cambios ya se encuentran activos. Si usted considera que se trata de un error o presenta problemas para acceder a sus nuevas funciones, por favor contacte al soporte técnico del sistema.
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
    $subject = "Confirmación: Nueva Solicitud de Investigación Creada";
    $antiClip = $this->getAntiClippingToken();

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le confirmamos que su solicitud de investigación ha sido creada exitosamente en nuestro sistema.
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
            Le informamos que la información de su solicitud de investigación ha sido actualizada correctamente.
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
            Le notificamos que el equipo técnico ha registrado un cambio en el proceso de su solicitud de investigación: <strong>{$requestName}</strong>.
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

  /**
   * Envía una notificación por correo cuando se crea una nueva geomanifestación.
   */
  public function notifyGeomanifestationCreated(
    string $email,
    string $firstName,
    string $name,
    ?string $description,
    ?string $province,
    ?string $canton,
    ?string $district,
    float $latitude,
    float $longitude,
    bool $visibility,
    string $time
  ): void {
    $subject = "Confirmación: Nueva Geomanifestación Registrada";
    $antiClip = $this->getAntiClippingToken();

    $visibilityLabel = $visibility ? "Pública" : "Privada (Oculta)";
    $visibilityColor = $visibility ? "#28a745" : "#dc3545";

    $locationInfo = array_filter([$province, $canton, $district]);
    $locationText = !empty($locationInfo) ? implode(', ', $locationInfo) : 'No especificada';

    $descHtml = !empty($description)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Descripción:</strong><br>" . nl2br(htmlspecialchars($description, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le confirmamos que se ha registrado exitosamente la geomanifestación <strong>{$name}</strong> en el sistema.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Detalles de la Geomanifestación
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 35%;'>Nombre:</td>
                <td style='padding: 6px 0;'>{$name}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Ubicación:</td>
                <td style='padding: 6px 0;'>{$locationText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Coordenadas:</td>
                <td style='padding: 6px 0;'>{$latitude}, {$longitude}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Visibilidad:</td>
                <td style='padding: 6px 0;'><span style='color: {$visibilityColor}; font-weight: bold;'>{$visibilityLabel}</span></td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fecha de registro:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$descHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Puede acceder a la plataforma GeoterRA para gestionar o consultar más información sobre esta geomanifestación.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Envía una notificación por correo cuando se actualiza una geomanifestación existente.
   */
  public function notifyGeomanifestationUpdated(
    string $email,
    string $firstName,
    string $name,
    ?string $description,
    ?string $province,
    ?string $canton,
    ?string $district,
    float $latitude,
    float $longitude,
    bool $visibility,
    string $time
  ): void {
    $subject = "Actualización: Geomanifestación Modificada";
    $antiClip = $this->getAntiClippingToken();

    $visibilityLabel = $visibility ? "Pública" : "Privada (Oculta)";
    $visibilityColor = $visibility ? "#28a745" : "#dc3545";

    $locationInfo = array_filter([$province, $canton, $district]);
    $locationText = !empty($locationInfo) ? implode(', ', $locationInfo) : 'No especificada';

    $descHtml = !empty($description)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Descripción:</strong><br>" . nl2br(htmlspecialchars($description, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le informamos que la información de la geomanifestación <strong>{$name}</strong> ha sido actualizada correctamente.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Estado Actualizado del Registro
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 35%;'>Nombre:</td>
                <td style='padding: 6px 0;'>{$name}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Ubicación:</td>
                <td style='padding: 6px 0;'>{$locationText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Coordenadas:</td>
                <td style='padding: 6px 0;'>{$latitude}, {$longitude}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Visibilidad:</td>
                <td style='padding: 6px 0;'><span style='color: {$visibilityColor}; font-weight: bold;'>{$visibilityLabel}</span></td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Última modificación:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$descHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Puede revisar los datos actualizados ingresando a su cuenta en el sistema.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends an email notification when a new in-situ test is created with complete measurements.
   *
   * @param string $email Recipient's email address.
   * @param string $firstName Recipient's first name.
   * @param string $geomanifestationName Name of the associated geomanifestation.
   * @param float|null $temperature Measured temperature in °C.
   * @param float|null $conductivity Measured conductivity in µS/cm.
   * @param float|null $ph Measured pH value.
   * @param string|null $description Additional test notes or description.
   * @param string $time Timestamp of creation.
   */
  public function notifyInsituTestCreated(
    string $email,
    string $firstName,
    string $geomanifestationName,
    ?float $temperature,
    ?float $conductivity,
    ?float $ph,
    ?string $description,
    string $time
  ): void {
    $subject = "Confirmación: Nueva Prueba In-Situ Registrada";
    $antiClip = $this->getAntiClippingToken();

    $tempText = $temperature !== null ? "{$temperature} °C" : 'No registrada';
    $condText = $conductivity !== null ? "{$conductivity} µS/cm" : 'No registrada';
    $phText = $ph !== null ? (string)$ph : 'No registrado';

    $descHtml = !empty($description)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Descripción / Notas:</strong><br>" . nl2br(htmlspecialchars($description, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le confirmamos que se ha registrado exitosamente una nueva <strong>prueba in-situ</strong> asociada a la geomanifestación <strong>{$geomanifestationName}</strong>.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Detalles de la Prueba In-Situ
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 40%;'>Geomanifestación:</td>
                <td style='padding: 6px 0;'>{$geomanifestationName}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Temperatura:</td>
                <td style='padding: 6px 0;'>{$tempText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Conductividad:</td>
                <td style='padding: 6px 0;'>{$condText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>pH:</td>
                <td style='padding: 6px 0;'>{$phText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fecha de registro:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$descHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Puede consultar esta información ingresando a la plataforma GeoterRA.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends an email notification when an existing in-situ test is updated.
   *
   * @param string $email Recipient's email address.
   * @param string $firstName Recipient's first name.
   * @param string $geomanifestationName Name of the associated geomanifestation.
   * @param float|null $temperature Updated temperature in °C.
   * @param float|null $conductivity Updated conductivity in µS/cm.
   * @param float|null $ph Updated pH value.
   * @param string|null $description Updated description or notes.
   * @param string $time Timestamp of modification.
   */
  public function notifyInsituTestUpdated(
    string $email,
    string $firstName,
    string $geomanifestationName,
    ?float $temperature,
    ?float $conductivity,
    ?float $ph,
    ?string $description,
    string $time
  ): void {
    $subject = "Actualización: Prueba In-Situ Modificada";
    $antiClip = $this->getAntiClippingToken();

    $tempText = $temperature !== null ? "{$temperature} °C" : 'No registrada';
    $condText = $conductivity !== null ? "{$conductivity} µS/cm" : 'No registrada';
    $phText = $ph !== null ? (string)$ph : 'No registrado';

    $descHtml = !empty($description)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Descripción / Notas:</strong><br>" . nl2br(htmlspecialchars($description, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le informamos que la información de una <strong>prueba in-situ</strong> asociada a la geomanifestación <strong>{$geomanifestationName}</strong> ha sido actualizada correctamente.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Estado Actualizado de la Prueba In-Situ
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 40%;'>Geomanifestación:</td>
                <td style='padding: 6px 0;'>{$geomanifestationName}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Temperatura:</td>
                <td style='padding: 6px 0;'>{$tempText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Conductividad:</td>
                <td style='padding: 6px 0;'>{$condText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>pH:</td>
                <td style='padding: 6px 0;'>{$phText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Última modificación:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$descHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Puede revisar los datos actualizados ingresando a su cuenta en el sistema.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends an email notification when an existing in-situ test is deleted.
   *
   * @param string $email Recipient's email address.
   * @param string $firstName Recipient's first name.
   * @param string $geomanifestationName Name of the associated geomanifestation.
   * @param float|null $temperature Measured temperature in °C.
   * @param float|null $conductivity Measured conductivity in µS/cm.
   * @param float|null $ph Measured pH value.
   * @param string|null $description Test notes or description.
   * @param string $time Timestamp of deletion.
   */
  public function notifyInsituTestDeleted(
    string $email,
    string $firstName,
    string $geomanifestationName,
    ?float $temperature,
    ?float $conductivity,
    ?float $ph,
    ?string $description,
    string $time
  ): void {
    $subject = "Eliminación: Prueba In-Situ Eliminada";
    $antiClip = $this->getAntiClippingToken();

    $tempText = $temperature !== null ? "{$temperature} °C" : 'No registrada';
    $condText = $conductivity !== null ? "{$conductivity} µS/cm" : 'No registrada';
    $phText = $ph !== null ? (string)$ph : 'No registrado';

    $descHtml = !empty($description)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Descripción / Notas:</strong><br>" . nl2br(htmlspecialchars($description, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le notificamos que una <strong>prueba in-situ</strong> asociada a la geomanifestación <strong>{$geomanifestationName}</strong> ha sido eliminada del sistema.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Detalles del Registro Eliminado
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 40%;'>Geomanifestación:</td>
                <td style='padding: 6px 0;'>{$geomanifestationName}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Temperatura:</td>
                <td style='padding: 6px 0;'>{$tempText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Conductividad:</td>
                <td style='padding: 6px 0;'>{$condText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>pH:</td>
                <td style='padding: 6px 0;'>{$phText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fecha de eliminación:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$descHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Esta acción es irreversible. Si considera que se trata de un error, por favor contacte al soporte del sistema de inmediato.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends an email notification when a new in-lab test is created.
   *
   * @param string $email Recipient's email address.
   * @param string $firstName Recipient's first name.
   * @param string $geomanifestationName Name of the associated geomanifestation.
   * @param float|null $ph Measured pH value.
   * @param float|null $conductivity Measured conductivity in µS/cm.
   * @param float|null $cl Chloride concentration.
   * @param float|null $ca Calcium concentration.
   * @param float|null $hco3 Bicarbonate concentration.
   * @param float|null $so4 Sulfate concentration.
   * @param float|null $fe Iron concentration.
   * @param float|null $si Silica concentration.
   * @param float|null $b Boron concentration.
   * @param float|null $li Lithium concentration.
   * @param float|null $f Fluoride concentration.
   * @param float|null $na Sodium concentration.
   * @param float|null $k Potassium concentration.
   * @param float|null $mg Magnesium concentration.
   * @param string|null $description Additional test notes or description.
   * @param string $time Timestamp of creation.
   */
  public function notifyInlabTestCreated(
    string $email,
    string $firstName,
    string $geomanifestationName,
    ?float $ph,
    ?float $conductivity,
    ?float $cl,
    ?float $ca,
    ?float $hco3,
    ?float $so4,
    ?float $fe,
    ?float $si,
    ?float $b,
    ?float $li,
    ?float $f,
    ?float $na,
    ?float $k,
    ?float $mg,
    ?string $description,
    string $time
  ): void {
    $subject = "Confirmación: Nueva Prueba de Laboratorio Registrada";
    $antiClip = $this->getAntiClippingToken();

    $phText = $ph !== null ? (string)$ph : 'No registrado';
    $condText = $conductivity !== null ? "{$conductivity} µS/cm" : 'No registrada';
    $clText = $cl !== null ? "{$cl} mg/L" : 'No registrado';
    $caText = $ca !== null ? "{$ca} mg/L" : 'No registrado';
    $hco3Text = $hco3 !== null ? "{$hco3} mg/L" : 'No registrado';
    $so4Text = $so4 !== null ? "{$so4} mg/L" : 'No registrado';
    $feText = $fe !== null ? "{$fe} mg/L" : 'No registrado';
    $siText = $si !== null ? "{$si} mg/L" : 'No registrado';
    $bText = $b !== null ? "{$b} mg/L" : 'No registrado';
    $liText = $li !== null ? "{$li} mg/L" : 'No registrado';
    $fText = $f !== null ? "{$f} mg/L" : 'No registrado';
    $naText = $na !== null ? "{$na} mg/L" : 'No registrado';
    $kText = $k !== null ? "{$k} mg/L" : 'No registrado';
    $mgText = $mg !== null ? "{$mg} mg/L" : 'No registrado';

    $descHtml = !empty($description)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Descripción / Notas:</strong><br>" . nl2br(htmlspecialchars($description, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le confirmamos que se ha registrado exitosamente una nueva <strong>prueba de laboratorio</strong> asociada a la geomanifestación <strong>{$geomanifestationName}</strong>.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Detalles de la Prueba de Laboratorio
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 45%;'>Geomanifestación:</td>
                <td style='padding: 6px 0;'>{$geomanifestationName}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>pH:</td>
                <td style='padding: 6px 0;'>{$phText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Conductividad:</td>
                <td style='padding: 6px 0;'>{$condText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Cloruro (Cl):</td>
                <td style='padding: 6px 0;'>{$clText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Calcio (Ca):</td>
                <td style='padding: 6px 0;'>{$caText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Bicarbonato (HCO₃):</td>
                <td style='padding: 6px 0;'>{$hco3Text}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Sulfato (SO₄):</td>
                <td style='padding: 6px 0;'>{$so4Text}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Hierro (Fe):</td>
                <td style='padding: 6px 0;'>{$feText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Sílice (Si):</td>
                <td style='padding: 6px 0;'>{$siText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Boro (B):</td>
                <td style='padding: 6px 0;'>{$bText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Litio (Li):</td>
                <td style='padding: 6px 0;'>{$liText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fluoruro (F):</td>
                <td style='padding: 6px 0;'>{$fText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Sodio (Na):</td>
                <td style='padding: 6px 0;'>{$naText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Potasio (K):</td>
                <td style='padding: 6px 0;'>{$kText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Magnesio (Mg):</td>
                <td style='padding: 6px 0;'>{$mgText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fecha de registro:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$descHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Puede consultar esta información ingresando a la plataforma GeoterRA.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends an email notification when an existing in-lab test is updated.
   *
   * @param string $email Recipient's email address.
   * @param string $firstName Recipient's first name.
   * @param string $geomanifestationName Name of the associated geomanifestation.
   * @param float|null $ph Updated pH value.
   * @param float|null $conductivity Updated conductivity in µS/cm.
   * @param float|null $cl Updated chloride concentration.
   * @param float|null $ca Updated calcium concentration.
   * @param float|null $hco3 Updated bicarbonate concentration.
   * @param float|null $so4 Updated sulfate concentration.
   * @param float|null $fe Updated iron concentration.
   * @param float|null $si Updated silica concentration.
   * @param float|null $b Updated boron concentration.
   * @param float|null $li Updated lithium concentration.
   * @param float|null $f Updated fluoride concentration.
   * @param float|null $na Updated sodium concentration.
   * @param float|null $k Updated potassium concentration.
   * @param float|null $mg Updated magnesium concentration.
   * @param string|null $description Updated test description or notes.
   * @param string $time Timestamp of modification.
   */
  public function notifyInlabTestUpdated(
    string $email,
    string $firstName,
    string $geomanifestationName,
    ?float $ph,
    ?float $conductivity,
    ?float $cl,
    ?float $ca,
    ?float $hco3,
    ?float $so4,
    ?float $fe,
    ?float $si,
    ?float $b,
    ?float $li,
    ?float $f,
    ?float $na,
    ?float $k,
    ?float $mg,
    ?string $description,
    string $time
  ): void {
    $subject = "Actualización: Prueba de Laboratorio Modificada";
    $antiClip = $this->getAntiClippingToken();

    $phText = $ph !== null ? (string)$ph : 'No registrado';
    $condText = $conductivity !== null ? "{$conductivity} µS/cm" : 'No registrada';
    $clText = $cl !== null ? "{$cl} mg/L" : 'No registrado';
    $caText = $ca !== null ? "{$ca} mg/L" : 'No registrado';
    $hco3Text = $hco3 !== null ? "{$hco3} mg/L" : 'No registrado';
    $so4Text = $so4 !== null ? "{$so4} mg/L" : 'No registrado';
    $feText = $fe !== null ? "{$fe} mg/L" : 'No registrado';
    $siText = $si !== null ? "{$si} mg/L" : 'No registrado';
    $bText = $b !== null ? "{$b} mg/L" : 'No registrado';
    $liText = $li !== null ? "{$li} mg/L" : 'No registrado';
    $fText = $f !== null ? "{$f} mg/L" : 'No registrado';
    $naText = $na !== null ? "{$na} mg/L" : 'No registrado';
    $kText = $k !== null ? "{$k} mg/L" : 'No registrado';
    $mgText = $mg !== null ? "{$mg} mg/L" : 'No registrado';

    $descHtml = !empty($description)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Descripción / Notas:</strong><br>" . nl2br(htmlspecialchars($description, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le informamos que la información de una <strong>prueba de laboratorio</strong> asociada a la geomanifestación <strong>{$geomanifestationName}</strong> ha sido actualizada correctamente.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Estado Actualizado de la Prueba de Laboratorio
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 45%;'>Geomanifestación:</td>
                <td style='padding: 6px 0;'>{$geomanifestationName}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>pH:</td>
                <td style='padding: 6px 0;'>{$phText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Conductividad:</td>
                <td style='padding: 6px 0;'>{$condText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Cloruro (Cl):</td>
                <td style='padding: 6px 0;'>{$clText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Calcio (Ca):</td>
                <td style='padding: 6px 0;'>{$caText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Bicarbonato (HCO₃):</td>
                <td style='padding: 6px 0;'>{$hco3Text}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Sulfato (SO₄):</td>
                <td style='padding: 6px 0;'>{$so4Text}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Hierro (Fe):</td>
                <td style='padding: 6px 0;'>{$feText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Sílice (Si):</td>
                <td style='padding: 6px 0;'>{$siText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Boro (B):</td>
                <td style='padding: 6px 0;'>{$bText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Litio (Li):</td>
                <td style='padding: 6px 0;'>{$liText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fluoruro (F):</td>
                <td style='padding: 6px 0;'>{$fText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Sodio (Na):</td>
                <td style='padding: 6px 0;'>{$naText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Potasio (K):</td>
                <td style='padding: 6px 0;'>{$kText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Magnesio (Mg):</td>
                <td style='padding: 6px 0;'>{$mgText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Última modificación:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$descHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Puede revisar los datos actualizados ingresando a su cuenta en el sistema.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Sends an email notification when an existing in-lab test is deleted.
   *
   * @param string $email Recipient's email address.
   * @param string $firstName Recipient's first name.
   * @param string $geomanifestationName Name of the associated geomanifestation.
   * @param float|null $ph Measured pH value.
   * @param float|null $conductivity Measured conductivity in µS/cm.
   * @param float|null $cl Chloride concentration.
   * @param float|null $ca Calcium concentration.
   * @param float|null $hco3 Bicarbonate concentration.
   * @param float|null $so4 Sulfate concentration.
   * @param float|null $fe Iron concentration.
   * @param float|null $si Silica concentration.
   * @param float|null $b Boron concentration.
   * @param float|null $li Lithium concentration.
   * @param float|null $f Fluoride concentration.
   * @param float|null $na Sodium concentration.
   * @param float|null $k Potassium concentration.
   * @param float|null $mg Magnesium concentration.
   * @param string|null $description Test notes or description.
   * @param string $time Timestamp of deletion.
   */
  public function notifyInlabTestDeleted(
    string $email,
    string $firstName,
    string $geomanifestationName,
    ?float $ph,
    ?float $conductivity,
    ?float $cl,
    ?float $ca,
    ?float $hco3,
    ?float $so4,
    ?float $fe,
    ?float $si,
    ?float $b,
    ?float $li,
    ?float $f,
    ?float $na,
    ?float $k,
    ?float $mg,
    ?string $description,
    string $time
  ): void {
    $subject = "Eliminación: Prueba de Laboratorio Eliminada";
    $antiClip = $this->getAntiClippingToken();

    $phText = $ph !== null ? (string)$ph : 'No registrado';
    $condText = $conductivity !== null ? "{$conductivity} µS/cm" : 'No registrada';
    $clText = $cl !== null ? "{$cl} mg/L" : 'No registrado';
    $caText = $ca !== null ? "{$ca} mg/L" : 'No registrado';
    $hco3Text = $hco3 !== null ? "{$hco3} mg/L" : 'No registrado';
    $so4Text = $so4 !== null ? "{$so4} mg/L" : 'No registrado';
    $feText = $fe !== null ? "{$fe} mg/L" : 'No registrado';
    $siText = $si !== null ? "{$si} mg/L" : 'No registrado';
    $bText = $b !== null ? "{$b} mg/L" : 'No registrado';
    $liText = $li !== null ? "{$li} mg/L" : 'No registrado';
    $fText = $f !== null ? "{$f} mg/L" : 'No registrado';
    $naText = $na !== null ? "{$na} mg/L" : 'No registrado';
    $kText = $k !== null ? "{$k} mg/L" : 'No registrado';
    $mgText = $mg !== null ? "{$mg} mg/L" : 'No registrado';

    $descHtml = !empty($description)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Descripción / Notas:</strong><br>" . nl2br(htmlspecialchars($description, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le notificamos que una <strong>prueba de laboratorio</strong> asociada a la geomanifestación <strong>{$geomanifestationName}</strong> ha sido eliminada del sistema.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Detalles del Registro Eliminado
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 45%;'>Geomanifestación:</td>
                <td style='padding: 6px 0;'>{$geomanifestationName}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>pH:</td>
                <td style='padding: 6px 0;'>{$phText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Conductividad:</td>
                <td style='padding: 6px 0;'>{$condText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Cloruro (Cl):</td>
                <td style='padding: 6px 0;'>{$clText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Calcio (Ca):</td>
                <td style='padding: 6px 0;'>{$caText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Bicarbonato (HCO₃):</td>
                <td style='padding: 6px 0;'>{$hco3Text}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Sulfato (SO₄):</td>
                <td style='padding: 6px 0;'>{$so4Text}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Hierro (Fe):</td>
                <td style='padding: 6px 0;'>{$feText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Sílice (Si):</td>
                <td style='padding: 6px 0;'>{$siText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Boro (B):</td>
                <td style='padding: 6px 0;'>{$bText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Litio (Li):</td>
                <td style='padding: 6px 0;'>{$liText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fluoruro (F):</td>
                <td style='padding: 6px 0;'>{$fText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Sodio (Na):</td>
                <td style='padding: 6px 0;'>{$naText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Potasio (K):</td>
                <td style='padding: 6px 0;'>{$kText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Magnesio (Mg):</td>
                <td style='padding: 6px 0;'>{$mgText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fecha de eliminación:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$descHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Esta acción es irreversible. Si considera que se trata de un error, por favor contacte al soporte del sistema de inmediato.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Envía una notificación por correo cuando se crea un nuevo reporte geotérmico.
   *
   * @param string $email Correo del destinatario.
   * @param string $firstName Nombre del usuario.
   * @param string $geomanifestationName Nombre de la geomanifestación asociada.
   * @param string|null $requestName Nombre/Descripción de la solicitud de investigación asociada.
   * @param string|null $details Detalles o notas del reporte geotérmico.
   * @param string $time Fecha y hora de creación.
   */
  public function notifyGeoreportCreated(
    string $email,
    string $firstName,
    string $geomanifestationName,
    ?string $requestName,
    ?string $details,
    string $time
  ): void {
    $subject = "Confirmación: Nuevo Reporte Geotérmico Registrado";
    $antiClip = $this->getAntiClippingToken();

    $reqText = !empty($requestName) ? htmlspecialchars($requestName, ENT_QUOTES, 'UTF-8') : 'Sin solicitud asociada';

    $detailsHtml = !empty($details)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Detalles / Descripción:</strong><br>" . nl2br(htmlspecialchars($details, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le confirmamos que se ha registrado exitosamente un nuevo <strong>reporte geotérmico</strong> en el sistema.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Detalles del Reporte
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 40%;'>Geomanifestación:</td>
                <td style='padding: 6px 0;'>" . htmlspecialchars($geomanifestationName, ENT_QUOTES, 'UTF-8') . "</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Solicitud Asociada:</td>
                <td style='padding: 6px 0;'>{$reqText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fecha de registro:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$detailsHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Puede consultar la información completa del reporte e inspeccionar sus pruebas asociadas ingresando a la plataforma GeoterRA.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  /**
   * Envía una notificación por correo cuando se actualiza un reporte geotérmico.
   *
   * @param string $email Correo del destinatario.
   * @param string $firstName Nombre del usuario.
   * @param string $geomanifestationName Nombre de la geomanifestación asociada.
   * @param string|null $requestName Nombre/Descripción de la solicitud de investigación asociada.
   * @param string|null $details Detalles o notas actualizadas del reporte geotérmico.
   * @param string $time Fecha y hora de actualización.
   */
  public function notifyGeoreportUpdated(
    string $email,
    string $firstName,
    string $geomanifestationName,
    ?string $requestName,
    ?string $details,
    string $time
  ): void {
    $subject = "Actualización: Reporte Geotérmico Modificado";
    $antiClip = $this->getAntiClippingToken();

    $reqText = !empty($requestName) ? htmlspecialchars($requestName, ENT_QUOTES, 'UTF-8') : 'Sin solicitud asociada';

    $detailsHtml = !empty($details)
      ? "<div style='margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #333333;'>
           <strong>Detalles / Descripción actualizados:</strong><br>" . nl2br(htmlspecialchars($details, ENT_QUOTES, 'UTF-8')) . "
         </div>"
      : "";

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le informamos que se han guardado exitosamente los cambios en un <strong>reporte geotérmico</strong> registrado previamente en el sistema.
          </p>

          <div style='margin: 25px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <h3 style='margin: 0 0 15px 0; font-size: 16px; color: #F19B29; border-bottom: 2px solid #F19B29; padding-bottom: 5px;'>
              Información del Reporte Actualizado
            </h3>

            <table style='width: 100%; font-size: 14px; border-collapse: collapse;'>
              <tr>
                <td style='padding: 6px 0; font-weight: bold; width: 40%;'>Geomanifestación:</td>
                <td style='padding: 6px 0;'>" . htmlspecialchars($geomanifestationName, ENT_QUOTES, 'UTF-8') . "</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Solicitud Asociada:</td>
                <td style='padding: 6px 0;'>{$reqText}</td>
              </tr>
              <tr>
                <td style='padding: 6px 0; font-weight: bold;'>Fecha de modificación:</td>
                <td style='padding: 6px 0;'>{$time}</td>
              </tr>
            </table>

            {$detailsHtml}
          </div>

          <p style='line-height: 1.5; color: #666666; font-size: 14px;'>
            Puede consultar los datos modificados e inspeccionar las pruebas actualizadas ingresando a la plataforma GeoterRA.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  public function notifyResourceCreated(
    string $email,
    string $firstName,
    string $resourceType,
    string $resourceName,
    string $time
  ): void {
    $subject = "Confirmación: Registro de {$resourceType}";
    $antiClip = $this->getAntiClippingToken();

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le confirmamos que el registro de <strong>{$resourceType}</strong> ha sido creado exitosamente en nuestro sistema.
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <p style='margin: 0 0 10px 0; font-size: 16px; word-break: break-word;'><strong>Detalle:</strong> <span style='color: #F19B29; font-weight: bold;'>{$resourceName}</span></p>
            <p style='margin: 0; font-size: 14px; color: #555555;'><strong>Fecha de registro:</strong> {$time}</p>
          </div>

          <p style='line-height: 1.5; color: #666666;'>
            Puede acceder al sistema para visualizar o gestionar este nuevo registro.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  public function notifyResourceUpdated(
    string $email,
    string $firstName,
    string $resourceType,
    string $resourceName,
    string $time
  ): void {
    $subject = "Actualización: {$resourceType} Modificado";
    $antiClip = $this->getAntiClippingToken();

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le informamos que la información del registro de <strong>{$resourceType}</strong> ha sido actualizada correctamente.
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <p style='margin: 0 0 10px 0; font-size: 16px; word-break: break-word;'><strong>Detalle:</strong> <span style='color: #F19B29; font-weight: bold;'>{$resourceName}</span></p>
            <p style='margin: 0; font-size: 14px; color: #555555;'><strong>Fecha de modificación:</strong> {$time}</p>
          </div>

          <p style='line-height: 1.5; color: #666666;'>
            Puede revisar los detalles actualizados ingresando a su cuenta en el sistema.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }

  public function notifyResourceDeleted(
    string $email,
    string $firstName,
    string $resourceType,
    string $resourceName,
    string $time
  ): void {
    $subject = "Eliminación: {$resourceType} Eliminado";
    $antiClip = $this->getAntiClippingToken();

    $body = "
      <div style='width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; word-break: break-word; box-sizing: border-box;'>
        <div style='background-color: #F19B29; padding: 20px; color: white;'>
          <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>GeoterRA</h1>
        </div>
        
        <div style='padding: 30px 20px;'>
          <h2 style='font-size: 18px; font-weight: bold; margin-top: 0;'>Hola {$firstName},</h2>
          
          <p style='line-height: 1.5;'>
            Le notificamos que el registro de <strong>{$resourceType}</strong> ha sido eliminado del sistema.
          </p>

          <div style='margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 8px;'>
            <p style='margin: 0 0 10px 0; font-size: 16px; word-break: break-word;'><strong>Detalle:</strong> <span style='color: #F19B29; font-weight: bold;'>{$resourceName}</span></p>
            <p style='margin: 0; font-size: 14px; color: #555555;'><strong>Fecha de eliminación:</strong> {$time}</p>
          </div>

          <p style='line-height: 1.5; color: #666666;'>
            Esta acción es irreversible. Si considera que se trata de un error, por favor contacte al soporte del sistema de inmediato.
          </p>
        </div>
        {$antiClip}
      </div>
    ";

    $this->emailSender->send($email, $subject, trim($body));
  }
}