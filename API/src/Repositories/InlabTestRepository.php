<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\InlabTestDTO;

/**
 * Repository for in-lab tests (inlab_tests table).
 */
final class InlabTestRepository extends Repository
{
  /**
   * Finds an in-lab test by its ULID.
   *
   * @param string $id
   * @return InlabTestDTO|null
   */
  public function findById(string $id): ?InlabTestDTO
  {
    $sql = "SELECT inlab_test_id, geomanifestation_id, ph, conductivity,
                       cl, ca, hco3, so4, fe, si, b, li, f, na, k, mg,
                       description, created_at, created_by
                FROM inlab_tests
                WHERE inlab_test_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? InlabTestDTO::fromDatabase($row) : null;
  }

  /**
   * Returns all in-lab tests for a given geomanifestation.
   *
   * @param string $geomanifestationId
   * @return InlabTestDTO[]
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    $sql = "SELECT inlab_test_id, geomanifestation_id, ph, conductivity,
                       cl, ca, hco3, so4, fe, si, b, li, f, na, k, mg,
                       description, created_at, created_by
                FROM inlab_tests
                WHERE geomanifestation_id = :gm_id
                ORDER BY created_at DESC";
    $stmt = $this->execute($sql, [':gm_id' => $geomanifestationId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map([InlabTestDTO::class, 'fromDatabase'], $rows);
  }

  /**
   * Creates a new in-lab test.
   *
   * @param InlabTestDTO $dto
   * @param string $createdBy
   * @return string The generated ULID
   */
  public function create(InlabTestDTO $dto, string $createdBy): string
  {
    $id = $this->generateUlid();
    $sql = "INSERT INTO inlab_tests (
                    inlab_test_id, geomanifestation_id,
                    ph, conductivity, cl, ca, hco3, so4, fe, si, b, li, f, na, k, mg,
                    description, created_by, created_at
                ) VALUES (
                    :id, :gm_id,
                    :ph, :cond, :cl, :ca, :hco3, :so4, :fe, :si, :b, :li, :f, :na, :k, :mg,
                    :desc, :created_by, NOW()
                )";
    $this->execute($sql, [
      ':id' => $id,
      ':gm_id' => $dto->geomanifestationId,
      ':ph' => $dto->ph,
      ':cond' => $dto->conductivity,
      ':cl' => $dto->cl,
      ':ca' => $dto->ca,
      ':hco3' => $dto->hco3,
      ':so4' => $dto->so4,
      ':fe' => $dto->fe,
      ':si' => $dto->si,
      ':b' => $dto->b,
      ':li' => $dto->li,
      ':f' => $dto->f,
      ':na' => $dto->na,
      ':k' => $dto->k,
      ':mg' => $dto->mg,
      ':desc' => $dto->description,
      ':created_by' => $createdBy
    ]);
    return $id;
  }

  /**
   * Updates an existing in-lab test.
   *
   * @param string $id
   * @param InlabTestDTO $dto
   * @return bool
   */
  public function update(string $id, InlabTestDTO $dto): bool
  {
    $sql = "UPDATE inlab_tests SET
                    geomanifestation_id = :gm_id,
                    ph = :ph,
                    conductivity = :cond,
                    cl = :cl,
                    ca = :ca,
                    hco3 = :hco3,
                    so4 = :so4,
                    fe = :fe,
                    si = :si,
                    b = :b,
                    li = :li,
                    f = :f,
                    na = :na,
                    k = :k,
                    mg = :mg,
                    description = :desc
                WHERE inlab_test_id = :id";
    $stmt = $this->execute($sql, [
      ':gm_id' => $dto->geomanifestationId,
      ':ph' => $dto->ph,
      ':cond' => $dto->conductivity,
      ':cl' => $dto->cl,
      ':ca' => $dto->ca,
      ':hco3' => $dto->hco3,
      ':so4' => $dto->so4,
      ':fe' => $dto->fe,
      ':si' => $dto->si,
      ':b' => $dto->b,
      ':li' => $dto->li,
      ':f' => $dto->f,
      ':na' => $dto->na,
      ':k' => $dto->k,
      ':mg' => $dto->mg,
      ':desc' => $dto->description,
      ':id' => $id
    ]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Deletes an in-lab test.
   *
   * @param string $id
   * @return bool
   */
  public function delete(string $id): bool
  {
    $sql = "DELETE FROM inlab_tests WHERE inlab_test_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    return $stmt->rowCount() > 0;
  }
}