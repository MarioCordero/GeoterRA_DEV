<?php

namespace Services\Utils;
/**
 * Provides a standardized structure for paginated responses across all services.
 */
trait PaginationBuilder
{
  /**
   * Builds paginated response structure.
   *
   * @param array<int, mixed> $data
   * @param int $total
   * @param int $page
   * @param int $limit
   * @return array{data: array<int, mixed>, pagination: array{current_page: int, per_page: int, total: int, last_page: int}}
   */
  protected function buildPaginationResponse(
    array $data,
    int $total,
    int $page,
    int $limit
  ): array {
    // Prevents division by zero in case of an invalid limit
    $safeLimit = $limit > 0 ? $limit : 20;

    return [
      'data' => $data,
      'pagination' => [
        'current_page' => $page,
        'per_page' => $safeLimit,
        'total' => $total,
        'last_page' => (int)ceil($total / $safeLimit),
      ],
    ];
  }
}