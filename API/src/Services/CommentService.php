<?php
declare(strict_types=1);

namespace Services;

use DTO\AllowedUserRoles;
use DTO\RegisterCommentDTO;
use DTO\UpdateCommentDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use PDO;
use Repositories\CommentRepository;
use Repositories\FieldTripRepository;
use Repositories\GeomanifestationRepository;
use Repositories\InvestigationRequestRepository;

/**
 * Business logic for polymorphic comments.
 */
final class CommentService
{
  private CommentRepository $repository;
  private FieldTripRepository $fieldTripRepository;
  private GeomanifestationRepository $geomanifestationRepository;
  private InvestigationRequestRepository $requestRepository;
  private AuthService $authService;

  public function __construct(private readonly PDO $pdo)
  {
    $this->repository = new CommentRepository($this->pdo);
    $this->fieldTripRepository = new FieldTripRepository($this->pdo);
    $this->geomanifestationRepository = new GeomanifestationRepository($this->pdo);
    $this->requestRepository = new InvestigationRequestRepository($this->pdo);
    $this->authService = new AuthService($this->pdo);
  }

  /**
   * Creates a new comment on an entity.
   *
   * @param string $entityType ('field_trip', 'request', 'geomanifestation')
   * @param string $entityId
   * @param RegisterCommentDTO $dto
   * @return array
   * @throws ApiException
   */
  public function create(string $entityType, string $entityId, RegisterCommentDTO $dto): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE,
    ]);

    $dto->validate($entityType);
    $this->validateEntityExists($entityType, $entityId);

    $auth = $this->authService->requireAuth();
    $created = $this->repository->create($entityType, $entityId, $auth['user_id'], $dto->commentText);

    return $this->formatComment($created);
  }

  /**
   * Retrieves all comments for a given entity.
   *
   * @param string $entityType
   * @param string $entityId
   * @return array[]
   * @throws ApiException
   */
  public function getByEntity(string $entityType, string $entityId): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE,
    ]);

    if (!in_array($entityType, RegisterCommentDTO::ALLOWED_ENTITY_TYPES, true)) {
      throw new ApiException(ErrorType::invalidField('entity_type. Allowed: field_trip, request, geomanifestation'), 422);
    }

    $this->validateEntityExists($entityType, $entityId);

    $comments = $this->repository->getByEntity($entityType, $entityId);
    return array_map(fn($c) => $this->formatComment($c), $comments);
  }

  /**
   * Updates an existing comment.
   * A user can only update their own comment, whereas an admin can update any comment.
   *
   * @param string $id
   * @param UpdateCommentDTO $dto
   * @return array
   * @throws ApiException
   */
  public function update(string $id, UpdateCommentDTO $dto): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE,
      AllowedUserRoles::USER,
    ]);

    $dto->validate();

    $comment = $this->repository->findById($id);
    if (!$comment) {
      throw new ApiException(ErrorType::notFound('Comment'), 404);
    }

    $auth = $this->authService->requireAuth();
    if ($auth['role'] !== AllowedUserRoles::ADMIN && $comment['user_id'] !== $auth['user_id']) {
      throw new ApiException(ErrorType::forbidden('You can only edit your own comments'), 403);
    }

    $updated = $this->repository->update($id, $dto->commentText);
    return $this->formatComment($updated);
  }

  /**
   * Deletes a comment by ID.
   * A user can only delete their own comment, whereas an admin can delete any comment.
   *
   * @param string $id
   * @return void
   * @throws ApiException
   */
  public function delete(string $id): void
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE,
      AllowedUserRoles::USER,
    ]);

    $comment = $this->repository->findById($id);
    if (!$comment) {
      throw new ApiException(ErrorType::notFound('Comment'), 404);
    }

    $auth = $this->authService->requireAuth();
    if ($auth['role'] !== AllowedUserRoles::ADMIN && $comment['user_id'] !== $auth['user_id']) {
      throw new ApiException(ErrorType::forbidden('You can only delete your own comments'), 403);
    }

    if (!$this->repository->delete($id)) {
      throw new ApiException(ErrorType::internal('Failed to delete comment'), 500);
    }
  }

  /**
   * Validates that the referenced entity exists.
   *
   * @param string $entityType
   * @param string $entityId
   * @throws ApiException
   */
  private function validateEntityExists(string $entityType, string $entityId): void
  {
    $exists = match ($entityType) {
      'field_trip' => (bool)$this->fieldTripRepository->findById($entityId),
      'request' => (bool)$this->requestRepository->findById($entityId),
      'geomanifestation' => (bool)$this->geomanifestationRepository->findById($entityId),
      default => false,
    };

    if (!$exists) {
      throw new ApiException(ErrorType::notFound(ucfirst($entityType)), 404);
    }
  }

  /**
   * Formats a raw database row into API response structure.
   */
  private function formatComment(array $row): array
  {
    return [
      'comment_id' => $row['comment_id'],
      'entity_type' => $row['entity_type'],
      'entity_id' => $row['entity_id'],
      'comment_text' => $row['comment_text'],
      'created_at' => $row['created_at'],
      'author' => [
        'user_id' => $row['user_id'],
        'first_name' => $row['first_name'] ?? null,
        'last_name' => $row['last_name'] ?? null,
        'email' => $row['email'] ?? null,
        'role' => $row['role'] ?? null,
      ],
    ];
  }
}
