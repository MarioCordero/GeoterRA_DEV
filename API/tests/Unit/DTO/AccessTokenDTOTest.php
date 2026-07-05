<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\AccessTokenDTO;
use PHPUnit\Framework\TestCase;

class AccessTokenDTOTest extends TestCase
{
    public function testCanCreateAccessTokenDTO(): void
    {
        // 1. Arrange (Set up the data)
        $userId = '01H8X5B4G5N6J7K8L9M0P1Q2R3'; // Example ULID
        $tokenHash = hash('sha256', 'my_raw_secret_token');
        $ttlSeconds = 3600;

        // 2. Act (Create the object)
        $dto = new AccessTokenDTO(
            userId: $userId,
            tokenHash: $tokenHash,
            ttlSeconds: $ttlSeconds
        );

        // 3. Assert (Verify the properties were set correctly)
        $this->assertSame($userId, $dto->userId);
        $this->assertSame($tokenHash, $dto->tokenHash);
        $this->assertSame($ttlSeconds, $dto->ttlSeconds);
    }
}