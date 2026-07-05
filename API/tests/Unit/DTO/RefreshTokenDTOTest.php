<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RefreshTokenDTO;
use PHPUnit\Framework\TestCase;

class RefreshTokenDTOTest extends TestCase
{
    public function testCanCreateRefreshTokenDTOWithoutFamilyId(): void
    {
        $userId = '01H8X5B4G5N6J7K8L9M0P1Q2R3';
        $tokenHash = hash('sha256', 'refresh_token_secret');
        $ttlSeconds = 86400; // 1 day

        $dto = new RefreshTokenDTO(
            userId: $userId,
            tokenHash: $tokenHash,
            ttlSeconds: $ttlSeconds
        );

        $this->assertSame($userId, $dto->userId);
        $this->assertSame($tokenHash, $dto->tokenHash);
        $this->assertSame($ttlSeconds, $dto->ttlSeconds);
        $this->assertNull($dto->familyId);
    }

    public function testCanCreateRefreshTokenDTOWithFamilyId(): void
    {
        $userId = '01H8X5B4G5N6J7K8L9M0P1Q2R3';
        $tokenHash = hash('sha256', 'refresh_token_secret');
        $ttlSeconds = 86400;
        $familyId = 'family-uuid-1234';

        $dto = new RefreshTokenDTO(
            userId: $userId,
            tokenHash: $tokenHash,
            ttlSeconds: $ttlSeconds,
            familyId: $familyId
        );

        $this->assertSame($userId, $dto->userId);
        $this->assertSame($tokenHash, $dto->tokenHash);
        $this->assertSame($ttlSeconds, $dto->ttlSeconds);
        $this->assertSame($familyId, $dto->familyId);
    }
}
