<?php
declare(strict_types=1);

namespace Controllers;

use DTO\RegisterCommentDTO;
use DTO\UpdateCommentDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use PDO;
use Services\CommentService;
use Throwable;

/**
 * Controller for polymorphic comments endpoints.
 */
final class CommentController
{
  private CommentService $service;

  public function __construct(private readonly PDO $pdo)
  {
    $this->service = new CommentService($pdo);
  }

  /**
   * GET /comments/{entity_type}/{entity_id}
   * Retrieves all comments for a given entity.
   */
  public function index(string $entityType, string $entityId): void
  {
    try {
      $comments = $this->service->getByEntity($entityType, $entityId);
      Response::success($comments);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /comments/{entity_type}/{entity_id}
   * Creates a new comment for a given entity.
   */
  public function store(string $entityType, string $entityId): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = RegisterCommentDTO::fromArray($body);
      $comment = $this->service->create($entityType, $entityId, $dto);
      Response::success($comment, null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /comments/{id}
   * Updates an existing comment (author or admin).
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateCommentDTO::fromArray($body);
      $comment = $this->service->update($id, $dto);
      Response::success($comment);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /comments/{id}
   * Deletes a comment by ID (author or admin).
   */
  public function delete(string $id): void
  {
    try {
      $this->service->delete($id);
      Response::success(['deleted' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}
