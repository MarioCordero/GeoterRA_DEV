<?php
declare(strict_types=1);

namespace Controllers;

use Services\AuthService;
use DTO\LoginUserDTO;
use Http\Request;
use Http\Response;
use RuntimeException;

final class LoginController
{
  public function __construct(private AuthService $service) {}

  public function __invoke(): void
  {
    try {
      $data = Request::json();
      if ($data === null) {
        Response::json(['error' => 'Empty or invalid JSON'], 400);
      }

      $dto = LoginUserDTO::fromArray($data);
      $dto->validate();

      $result = $this->service->login($dto);

      Response::success(
        $result['data'],
        $result['meta'],
        200
      );

    } catch (RuntimeException $e) {
      Response::json(['error' => $e->getMessage()], 401);
    } catch (\Throwable $e) {
      // Captura cualquier otro error inesperado
      Response::error('Internal server error', 500, ['detail' => $e->getMessage()]);
    }
  }
}
