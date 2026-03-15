<?php
// src/Services/RegionService.php
declare(strict_types=1);

namespace Services;

use Repositories\RegionRepository;

/**
 * Business logic for registered geothermal manifestations
 */
final class RegionService
{
  private RegionRepository $regionRepository;
  public function __construct(private \PDO $pdo)
  {
    $this->regionRepository = new RegionRepository($this->pdo);
  }

  /**
   * Fetch all manifestations by region
   */
  public function getAll(): array
  {
    return $this->regionRepository->getAll();
  }

}