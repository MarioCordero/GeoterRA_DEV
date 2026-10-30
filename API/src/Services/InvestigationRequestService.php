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
use Services\Utils\PaginationBuilder;
use Throwable;

/**
 * Service handling business logic for investigation requests.
 */
final class InvestigationRequestService
{
  use PaginationBuilder;

  private InvestigationRequestRepository $repository;
  private UserRepository $userRepository;
  private NotificationService $notificationService;

  public function __construct(private PDO $pdo)
  {
    $this->userRepository = new UserRepository($pdo);
    $this->repository = new InvestigationRequestRepository($pdo);
    $this->notificationService = new NotificationService(new SmtpEmailService());
  }

  /**
   * Retrieves a paginated and filtered list of requests belonging to the current user.
   *
   * @param int $page Current pagination page.
   * @param int $limit Maximum number of results per page.
   * @param int|null $provinceSnitCode Optional filter by province SNIT.
   * @param int|null $cantonSnitCode Optional filter by canton SNIT.
   * @param int|null $districtSnitCode Optional filter by district SNIT.
   * @return array Standardized pagination response structure.
   */
  public function getAllByUser(
    int $page = 1,
    int $limit = 20,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null
  ): array {
    $user = Request::getUser();

    $safeLimit = $limit > 0 ? $limit : 20;
    $safePage = $page > 0 ? $page : 1;
    $offset = ($safePage - 1) * $safeLimit;

    $rows = $this->repository->findAllByUserPaginated(
      $user['user_id'],
      $safeLimit,
      $offset,
      $provinceSnitCode,
      $cantonSnitCode,
      $districtSnitCode
    );

    $total = $this->repository->countAllByUser(
      $user['user_id'],
      $provinceSnitCode,
      $cantonSnitCode,
      $districtSnitCode
    );

    $formattedData = array_map([$this, 'formatRequest'], $rows);

    return $this->buildPaginationResponse($formattedData, $total, $safePage, $safeLimit);
  }

  /**
   * Retrieves a specific request by ID, verifying user ownership.
   *
   * @param string $id Unique request identifier.
   * @return array Formatted request payload.
   * @throws ApiException If request is not found or unauthorized.
   */
  public function getById(string $id): array
  {
    $user = Request::getUser();
    $row = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$row) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }
    return $this->formatRequest($row);
  }

  /**
   * Creates a new investigation request and emits a notification.
   *
   * @param RegisterInvestigationRequestDTO $dto Validated transfer object.
   * @return array Formatted created request.
   * @throws ApiException In case of unexpected server failures.
   */
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

      $activeUser = $this->userRepository->findActiveUserById($user['user_id']);
      if ($activeUser) {
        $this->notificationService->notifyRequestCreated(
          $activeUser['email'],
          $activeUser['first_name'],
          $result['request_name'],
          date('Y-m-d H:i:s')
        );
      }

      return $this->formatRequest($result);
    } catch (Throwable $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      throw new ApiException(
        ErrorType::internal('Failed to create request: ' . $e->getMessage()),
        500
      );
    }
  }

  /**
   * Updates an existing request owned by the user, if it remains in 'Pendiente' state.
   *
   * @param string $id Unique request identifier.
   * @param UpdateInvestigationRequestDTO $dto Validated update transfer object.
   * @return array Formatted updated request.
   * @throws ApiException If request is invalid, missing, or locked.
   */
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

    $activeUser = $this->userRepository->findActiveUserById($user['user_id']);
    if ($activeUser) {
      $this->notificationService->notifyRequestUpdated(
        $activeUser['email'],
        $activeUser['first_name'],
        $result['request_name'],
        date('Y-m-d H:i:s')
      );
    }

    return $this->formatRequest($result);
  }

  /**
   * Deletes an investigation request owned by the user.
   *
   * @param string $id Unique request identifier.
   * @return void
   * @throws ApiException
   */
  public function delete(string $id): void
  {
    $user = Request::getUser();

    $existing = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$existing) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }
    $this->repository->delete($id, $user['user_id']);
  }

  /**
   * Returns state tracking records for a specific request owned by the user.
   *
   * @param string $id Unique request identifier.
   * @return array List of history states.
   * @throws ApiException
   */
  public function getStates(string $id): array
  {
    $user = Request::getUser();

    $request = $this->repository->findByIdAndUser($id, $user['user_id']);
    if (!$request) {
      throw new ApiException(ErrorType::analysisRequestNotFound(), 404);
    }

    return $this->repository->getStatesByRequestId($id);
  }

  /**
   * Allows an admin to attach a new state tracking update to any request.
   *
   * @param string $id Unique request identifier.
   * @param string $stateValue The new label (e.g. Aprobado).
   * @param string $description The audit note.
   * @return void
   * @throws ApiException
   */
  public function adminAddState(string $id, string $stateValue, string $description): void
  {
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

    $owner = $this->userRepository->findById($request['user_id']);
    if ($owner) {
      $this->notificationService->notifyRequestStateChanged(
        $owner['email'],
        $owner['first_name'],
        $request['request_name'],
        $stateValue,
        $description,
        date('Y-m-d H:i:s')
      );
    }
  }

  /**
   * Retrieves administrative state tracking records for any given request.
   *
   * @param string $id Unique request identifier.
   * @return array List of history states.
   * @throws ApiException
   */
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

  /**
   * Retrieves a globally paginated and filtered list of requests with administrative scope.
   *
   * @param int $page Current pagination page.
   * @param int $limit Maximum number of results per page.
   * @param int|null $provinceSnitCode Filter by province SNIT.
   * @param int|null $cantonSnitCode Filter by canton SNIT.
   * @param int|null $districtSnitCode Filter by district SNIT.
   * @param string|null $requestName Filter by request name.
   * @param string|null $userName Filter by user's first or last name.
   * @param string|null $userEmail Filter by user's email.
   * @return array Standardized pagination response structure.
   */
  public function adminGetAll(
    int $page = 1,
    int $limit = 20,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null,
    ?string $requestName = null,
    ?string $userName = null,
    ?string $userEmail = null
  ): array {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR,
        AllowedUserRoles::MAINTENANCE,
      ]
    );

    $safeLimit = $limit > 0 ? $limit : 20;
    $safePage = $page > 0 ? $page : 1;
    $offset = ($safePage - 1) * $safeLimit;

    $rows = $this->repository->getAllPaginated(
      $safeLimit,
      $offset,
      $provinceSnitCode,
      $cantonSnitCode,
      $districtSnitCode,
      $requestName,
      $userName,
      $userEmail
    );

    $total = $this->repository->countAll(
      $provinceSnitCode,
      $cantonSnitCode,
      $districtSnitCode,
      $requestName,
      $userName,
      $userEmail
    );

    $formattedData = array_map([$this, 'formatRequest'], $rows);

    return $this->buildPaginationResponse($formattedData, $total, $safePage, $safeLimit);
  }

  /**
   * Returns any analysis request by ID, ignoring standard ownership checks.
   *
   * @param string $id Unique request identifier.
   * @return array Formatted request payload.
   * @throws ApiException
   */
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

  /**
   * Helper method to map raw database rows to strict API JSON contracts.
   *
   * @param array $row Raw dataset from PDO.
   * @return array API mapped array.
   */
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