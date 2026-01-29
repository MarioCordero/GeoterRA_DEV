<?php
declare(strict_types=1);

namespace Controllers;

use Services\AuthService;
use DTO\LoginUserDTO;
use Http\ApiException;
use Http\Request;
use Http\Response;
use Http\ErrorType;

final class LoginController
{
  public function __construct(private AuthService $service) {}

  public function __invoke(): void
  {
    try {
      $data = Request::json();
      if ($data === null) {
        Response::error(ErrorType::invalidJson(), 400);
      }

      $dto = LoginUserDTO::fromArray($data);
      try {
        $dto->validate();
      } catch (ApiException $e) {
        Response::error($e->getError(), 422);
      }

      $result = $this->service->login($dto);

      Response::success(
        $result['data'],
        $result['meta'],
        200
      );

    } catch (ApiException $e) {
      // Credenciales inválidas
      Response::error($e->getError(), 401);
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}
?>