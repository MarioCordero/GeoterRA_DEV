<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\AccessTokenDTO;
use DTO\RefreshTokenDTO;
use DTO\TokensRotationDTO;
use PHPUnit\Framework\TestCase;

class TokensRotationDTOTest extends TestCase
{
    public function testCanCreateTokensRotationDTO(): void
    {
        $accessToken = new AccessTokenDTO('user123', 'access_hash', 3600);
        $refreshToken = new RefreshTokenDTO('user123', 'refresh_hash', 86400, 'family123');

        $dto = new TokensRotationDTO($accessToken, $refreshToken);

        $this->assertSame($accessToken, $dto->accessToken);
        $this->assertSame($refreshToken, $dto->refreshToken);
    }
}
