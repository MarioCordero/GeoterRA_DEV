<?php
declare(strict_types=1);

namespace Services;

use DTO\AllowedUserRoles;
use DTO\RegisterInvestigationRequestDTO;
use DTO\UpdateInvestigationRequestDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use PDO;
use Repositories\InvestigationRequestRepository;
use Repositories\UserRepository;
use Throwable;

final class InvestigationRequestService
{
  private InvestigationRequestRepository $repository;
  private UserRepository $userRepository;

  public function __construct(private PDO $pdo)
  {
    $this->userRepository = new UserRepository($pdo);
    $this->repository = new InvestigationRequestRepository($pdo);
  }

  public function getAllByUser(): array
  {
    $user = Request::getUser();
    $rows = $this->repository->findAllByUser($user['user_id']);
    return array_map([$this, 'formatRequest'], $rows);
  }

  public function getById(string $id): array
  {
    $user = Request::getUser();
    $row = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$row) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }
    return $this->formatRequest($row);
  }

  public function create(RegisterInvestigationRequestDTO $dto): array
  {
    $user = Request::getUser();
    $dto->validate();

    if ($dto->relationWithOwner === 'Titular') {
      $user = $this->userRepository->findActiveUserById($user['user_id']);
      if ($user) {
        $dto->ownerName = trim($user['first_name'] . ' ' . $user['last_name']);
        $dto->ownerPhoneNumber = $user['phone_number'];
        $dto->ownerEmail = $user['email'];
      }
    }

    try {
      $this->pdo->beginTransaction();
      $result = $this->repository->create($dto, $user['user_id']);
      $this->pdo->commit();
      return $this->formatRequest($result);
    } catch (Throwable $e) {
      $this->pdo->rollBack();
      throw new ApiException(
        ErrorType::internal('Failed to create request: ' . $e->getMessage()),
        500
      );
    }
  }

  public function update(string $id, UpdateInvestigationRequestDTO $dto): array
  {
    $user = Request::getUser();
    $dto->validate();

    $existing = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$existing) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }

    if (($existing['current_state'] ?? '') !== 'Pendiente') {
      throw new ApiException(
        ErrorType::invalidField(
          'Only requests in "Pendiente" state can be modified'
        ),
        422
      );
    }


    if ($dto->relationWithOwner === 'Titular') {
      $user = $this->userRepository->findActiveUserById($user['user_id']);
      if ($user) {
        $dto->ownerName = trim($user['first_name'] . ' ' . $user['last_name']);
        $dto->ownerPhoneNumber = $user['phone_number'];
        $dto->ownerEmail = $user['email'];
      }
    }

    $result = $this->repository->update($id, $user['user_id'], $dto);
    return $this->formatRequest($result);
  }


  public function delete(string $id): void
  {
    $user = Request::getUser();

    $existing = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$existing) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }
    $this->repository->delete($id, $user['user_id']);
  }
  public function getStates(string $id): array
  {
    $user = Request::getUser();

    $request = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$request) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }

    return $this->repository->getStatesByRequestId($id);
  }

  public function adminAddState(string $id, string $stateValue, string $description
  ): void {
    $user = Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $request = $this->repository->findById($id);
    if (!$request) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }

    $this->repository->addState(
      $id, $stateValue, $description, $user['user_id']
    );
  }

  public function adminGetStates(string $id): array
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR,
        AllowedUserRoles::MAINTENANCE
      ]
    );

    $request = $this->repository->findById($id);
    if (!$request) {
      throw new ApiException(
        ErrorType::analysisRequestNotFound(), 404
      );
    }

    return $this->repository->getStatesByRequestId($id);
  }

  public function adminGetAll(): array
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR,
        AllowedUserRoles::MAINTENANCE,
      ]
    );

    $rows = $this->repository->getAll();
    return array_map([$this, 'formatRequest'], $rows);
  }


  public function adminGetById(string $id): array
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR,
        AllowedUserRoles::MAINTENANCE,
      ]
    );

    $row = $this->repository->findById($id);
    if (!$row) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }
    return $this->formatRequest($row);
  }

  private function formatRequest(array $row): array
  {
    $currentState = null;
    if (isset($row['current_state'])) {
      $currentState = [
        'value' => $row['current_state'],
        'description' => $row['state_description'] ?? null,
        'created_at' => $row['state_created_at'] ?? null,
      ];
    }

    $result = [
      'request_id' => $row['request_id'],
      'request_name' => $row['request_name'],
      'owner_name' => $row['owner_name'],
      'owner_phone_number' => $row['owner_phone_number'],
      'owner_email' => $row['owner_email'],
      'current_usage' => $row['current_usage'],
      'temperature_sensation' => $row['temperature_sensation'],
      'bubbles' => (bool)$row['bubbles'],
      'details' => $row['details'],
      'exact_address' => $row['exact_address'],
      'relation_with_owner' => $row['relation_with_owner'],
      'created_at' => $row['created_at'],
			'location' => [
				'province' => $row['province_name'],
				'province_snit_code' => $row['province_snit_code'],
				'canton' => $row['canton_name'],
				'canton_snit_code' => $row['canton_snit_code'],
				'district' => $row['district_name'],
				'district_snit_code' => $row['district_snit_code'],
				'latitude' => round((float)$row['latitude'], 7),
				'longitude' => round((float)$row['longitude'], 7),
			],
      'current_state' => $currentState,
    ];

    // Include user info if available (only for admin queries)
    if (isset($row['user_first_name']) || isset($row['user_last_name'])) {
      $result['user_first_name'] = $row['user_first_name'] ?? null;
      $result['user_last_name'] = $row['user_last_name'] ?? null;
    }

    return $result;
  }
}