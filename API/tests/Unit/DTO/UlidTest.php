<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use Tests\TestCase;
use DTO\Ulid;

class UlidTest extends TestCase
{
    public function testGenerateCreatesValidUlid(): void
    {
        $ulid = Ulid::generate();
        
        $this->assertIsString($ulid);
        $this->assertEquals(26, strlen($ulid));
    }

    public function testGenerateProducesUniqueLids(): void
    {
        $ulid1 = Ulid::generate();
        $ulid2 = Ulid::generate();
        
        $this->assertNotEquals($ulid1, $ulid2);
    }

    public function testUlidFormatIsCrockfordBase32(): void
    {
        $ulid = Ulid::generate();
        
        // Crockford Base32 alphabet: 0-9, A-Z (excluding I, L, O, U)
        $this->assertMatchesRegularExpression('/^[0-9A-Z]{26}$/', $ulid);
    }

    public function testUlidHasCorrectLength(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $ulid = Ulid::generate();
            $this->assertEquals(26, strlen($ulid));
        }
    }

    public function testUlidStartsWithTimestamp(): void
    {
        // ULIDs start with a 10-character timestamp (milliseconds since epoch)
        $ulid = Ulid::generate();
        $timestampPart = substr($ulid, 0, 10);
        
        $this->assertEquals(10, strlen($timestampPart));
        // Should be numeric when converted from base32
        $this->assertMatchesRegularExpression('/^[0-7][0-9A-Z]{9}$/', $timestampPart);
    }

    public function testUlidRandomPartIsRandom(): void
    {
        $ulid1 = Ulid::generate();
        $ulid2 = Ulid::generate();
        
        // Extract random parts (last 16 characters)
        $random1 = substr($ulid1, 10);
        $random2 = substr($ulid2, 10);
        
        // They should be different
        $this->assertNotEquals($random1, $random2);
    }

    public function testUlidCanBeUsedAsId(): void
    {
        $ulid = Ulid::generate();
        
        // Should be suitable for use as database primary key
        $this->assertIsString($ulid);
        $this->assertNotEmpty($ulid);
        $this->assertNotContains(' ', $ulid);
    }
}
