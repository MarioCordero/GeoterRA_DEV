<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

final class RegionDTO
{
  private string $name;

  public function __construct(array $data)
  {
    $this->name = trim($data['name'] ?? '');
  }

  public function validate(): void
  {
    $validRegions = [
      'Guanacaste',
      'Alajuela',
      'San José',
      'Puntarenas',
      'Limón',
      'Heredia',
      'Cartago'
    ];

    if (empty($this->name)) {
      throw new ApiException(ErrorType::requiredField('name'), 400);
    }

    if (!in_array($this->name, $validRegions, true)) {
      throw new ApiException(
        ErrorType::validationError('name must be one of: ' . implode(', ', $validRegions)),
        400
      );
    }
  }

  public function getName(): string
  {
    return $this->name;
  }
}