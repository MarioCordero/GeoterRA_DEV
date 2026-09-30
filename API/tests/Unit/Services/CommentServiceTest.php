<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Core\UlidGenerator;
use DTO\AllowedUserRoles;
use DTO\UpdateCommentDTO;
use Http\ApiException;
use Http\Request;
use Services\CommentService;
use Tests\TestCase;

class CommentServiceTest extends TestCase
{
  private CommentService $service;

  protected function setUp(): void
  {
    parent::setUp();
    $this->service = new CommentService($this->pdo);
    Request::setUser(null);
  }

  protected function tearDown(): void
  {
    Request::setUser(null);
    parent::tearDown();
  }

  private function authenticateAs(array $user): void
  {
    Request::setUser($user);
    $_SERVER['HTTP_X_API_KEY'] = 'web-secret-key-789';
    $tokenData = $this->createTestAccessToken($user['user_id']);
    $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $tokenData['token'];
    $_COOKIE['geoterra_session_token'] = $tokenData['token'];
    Request::init();
  }

  private function createComment(string $userId, string $text = 'Comentario inicial'): array
  {
    $commentId = UlidGenerator::generate();
    $entityId = UlidGenerator::generate();

    $this->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    $stmt = $this->pdo->prepare("
      INSERT INTO requests (request_id, user_id, province_snit_code, canton_snit_code, district_snit_code, request_name, latitude, longitude)
      VALUES (:req_id, :uid, 1, 101, 10101, 'SOLI-TEST', 9.93, -84.08)
    ");
    $stmt->execute([
      'req_id' => $entityId,
      'uid' => $userId,
    ]);

    $stmt = $this->pdo->prepare("
      INSERT INTO comments (comment_id, entity_type, entity_id, user_id, comment_text, created_at)
      VALUES (:id, 'request', :entity_id, :user_id, :text, NOW())
    ");
    $stmt->execute([
      'id' => $commentId,
      'entity_id' => $entityId,
      'user_id' => $userId,
      'text' => $text,
    ]);
    $this->pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

    return [
      'comment_id' => $commentId,
      'entity_id' => $entityId,
      'user_id' => $userId,
      'comment_text' => $text,
    ];
  }

  public function testServiceCanBeInstantiated(): void
  {
    $this->assertInstanceOf(CommentService::class, $this->service);
  }

  public function testAuthorCanUpdateOwnComment(): void
  {
    $author = $this->createTestUser(['role' => AllowedUserRoles::FIELD_INVESTIGATOR]);
    $this->authenticateAs($author);

    $comment = $this->createComment($author['user_id'], 'Texto original');

    $dto = new UpdateCommentDTO('Texto editado por el autor');
    $updated = $this->service->update($comment['comment_id'], $dto);

    $this->assertSame('Texto editado por el autor', $updated['comment_text']);
  }

  public function testAdminCannotUpdateAnotherUsersComment(): void
  {
    $author = $this->createTestUser(['role' => AllowedUserRoles::USER]);
    $admin = $this->createTestUser(['role' => AllowedUserRoles::ADMIN]);

    $comment = $this->createComment($author['user_id'], 'Comentario del usuario');

    // Autenticado como Admin
    $this->authenticateAs($admin);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(403);

    $dto = new UpdateCommentDTO('Admin intentando editar');
    $this->service->update($comment['comment_id'], $dto);
  }

  public function testAnotherUserCannotUpdateSomeoneElsesComment(): void
  {
    $author = $this->createTestUser(['role' => AllowedUserRoles::FIELD_INVESTIGATOR]);
    $otherUser = $this->createTestUser(['role' => AllowedUserRoles::INVESTIGATOR]);

    $comment = $this->createComment($author['user_id'], 'Comentario del autor');

    // Autenticado como otro usuario
    $this->authenticateAs($otherUser);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(403);

    $dto = new UpdateCommentDTO('Otro usuario intentando editar');
    $this->service->update($comment['comment_id'], $dto);
  }

  public function testUpdateThrowsNotFoundForNonExistentComment(): void
  {
    $user = $this->createTestUser(['role' => AllowedUserRoles::ADMIN]);
    $this->authenticateAs($user);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(404);

    $dto = new UpdateCommentDTO('Texto');
    $this->service->update(UlidGenerator::generate(), $dto);
  }

  public function testAdminCannotDeleteAnotherUsersComment(): void
  {
    $author = $this->createTestUser(['role' => AllowedUserRoles::USER]);
    $admin = $this->createTestUser(['role' => AllowedUserRoles::ADMIN]);

    $comment = $this->createComment($author['user_id'], 'Comentario a borrar');

    $this->authenticateAs($admin);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(403);

    $this->service->delete($comment['comment_id']);
  }

  public function testAuthorCanDeleteOwnComment(): void
  {
    $author = $this->createTestUser(['role' => AllowedUserRoles::FIELD_INVESTIGATOR]);
    $comment = $this->createComment($author['user_id'], 'Comentario propio');

    $this->authenticateAs($author);
    $this->service->delete($comment['comment_id']);

    $stmt = $this->pdo->prepare("SELECT * FROM comments WHERE comment_id = :id");
    $stmt->execute(['id' => $comment['comment_id']]);
    $this->assertFalse($stmt->fetch());
  }

  public function testUserCannotDeleteAnotherUsersComment(): void
  {
    $author = $this->createTestUser(['role' => AllowedUserRoles::USER]);
    $otherUser = $this->createTestUser(['role' => AllowedUserRoles::FIELD_INVESTIGATOR]);

    $comment = $this->createComment($author['user_id'], 'Comentario');

    $this->authenticateAs($otherUser);

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(403);

    $this->service->delete($comment['comment_id']);
  }
}
