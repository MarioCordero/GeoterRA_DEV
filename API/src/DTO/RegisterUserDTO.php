<?php
declare(strict_types=1);

namespace DTO;
use Http\ErrorType;
use Http\ApiException;


final class RegisterUserDTO
{
  public function __construct(
    public string $firstName,
    public string $lastName,
    public string $email,
    public ?string $phoneNumber,
    public string $password
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      trim($data['name'] ?? ''),
      trim($data['lastname'] ?? ''),
      strtolower(trim($data['email'] ?? '')),
      $data['phone'] ?? null,
      $data['password'] ?? ''
    );
  }

  /**
   * Validates the registration data.
   */
  public function validate(): void
  {
    if ($this->firstName === '') {
      throw new ApiException(ErrorType::missingField('name'), 422);
    }

    if ($this->lastName === '') {
      throw new ApiException(ErrorType::missingField('lastname'), 422);
    }

    if ($this->email === '') {
      throw new ApiException(ErrorType::missingField('email'), 422);
    }

    if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
      throw new ApiException(ErrorType::invalidEmail(), 422);
    }

    if ($this->password === '') {
      throw new ApiException(ErrorType::missingField('password'), 422);
    }

    if (strlen($this->password) < 8) {
      throw new ApiException(ErrorType::weakPassword(), 422);
    }

    // Validate minimum password length.
    if (strlen($this->password) < 8) {
      throw new ApiException(ErrorType::weakPassword(), 422);
    }

    
    // Password complexity validation. 
    $passwordPattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/';

    if (!preg_match($passwordPattern, $this->password)) {
      throw new ApiException(ErrorType::weakPassword(), 422);
    }

    // Prevent the password from containing the email address for better security.
    if (stripos($this->password, $this->email) !== false) {
      throw new ApiException(ErrorType::weakPassword(), 422);
    }

    // Check password doesn't contain email components
    $emailParts = explode('@', $this->email);
    foreach ($emailParts as $part) {
      if (strlen($part) > 3 && stripos($this->password, $part) !== false) {
        throw new ApiException(ErrorType::weakPassword(), 422);
      }
    }

    if ($this->phoneNumber !== null && trim($this->phoneNumber) !== '') {
      // Accept international format like +56912345678 or just digits like 56912345678
      if (!preg_match('/^\+?[\d\-\s\(\)]{7,20}$/', $this->phoneNumber)) {
        throw new ApiException(
          ErrorType::invalidField('phone'),
          422
        );
      }
      
      // Extract just digits to validate length
      $digitsOnly = preg_replace('/\D/', '', $this->phoneNumber);
      if (strlen($digitsOnly) < 8 || strlen($digitsOnly) > 15) {
        throw new ApiException(
          ErrorType::invalidField('phone'),
          422
        );
      }
    }
  }
}
?>