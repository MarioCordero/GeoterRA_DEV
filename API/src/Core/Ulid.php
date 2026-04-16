<?php

declare(strict_types=1);

namespace Core;

/**
 * ULID Generator
 * 
 * Generates Universally Unique Lexicographically Sortable Identifiers (ULIDs)
 * Format: 26 characters, Crockford Base32 encoding, sortable by timestamp
 * 
 * @since 1.0.0
 */
class Ulid
{
    /**
     * Crockford Base32 alphabet for ULID encoding
     */
    private const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

    /**
     * Generate a new ULID
     * 
     * Returns a 26-character ULID string:
     * - 10 characters: timestamp (48 bits, milliseconds since Unix epoch)
     * - 16 characters: randomness (80 bits)
     * 
     * ULIDs are:
     * - Sortable by timestamp
     * - Unique (probability of collision is negligible)
     * - Case-insensitive
     * - URL-safe
     * 
     * @return string The generated ULID (26 characters, lowercase)
     * 
     * @example
     * $id = Ulid::generate();
     * // Output: "01arkvgvjg69r8jfq69r8jfq"
     */
    public static function generate(): string
    {
        // Get current time in milliseconds
        $timestamp = intdiv((int)(microtime(true) * 1000), 1);
        
        // Generate 10 random bytes for randomness
        $randomness = random_bytes(10);
        
        // Encode timestamp (6 bytes, 10 characters)
        $timeEncoded = self::encodeTime($timestamp);
        
        // Encode randomness (10 bytes, 16 characters)
        $randomnessEncoded = self::encodeRandomness($randomness);
        
        return strtolower($timeEncoded . $randomnessEncoded);
    }

    /**
     * Encode timestamp to ULID format
     * 
     * Converts 48-bit timestamp (milliseconds) to 10 Crockford Base32 characters
     * 
     * @param int $timestamp Milliseconds since Unix epoch
     * @return string 10-character timestamp portion
     */
    private static function encodeTime(int $timestamp): string
    {
        $time = [];
        
        // Encode 48-bit timestamp into 10 Base32 characters
        for ($i = 9; $i >= 0; $i--) {
            $time[$i] = self::ALPHABET[$timestamp % 32];
            $timestamp = intdiv($timestamp, 32);
        }
        
        return implode('', $time);
    }

    /**
     * Encode randomness bytes to ULID format
     * 
     * Converts 80 random bits to 16 Crockford Base32 characters
     * 
     * @param string $randomBytes 10 random bytes
     * @return string 16-character randomness portion
     */
    private static function encodeRandomness(string $randomBytes): string
    {
        $random = [];
        $bitBuffer = 0;
        $bitCount = 0;
        $byteIndex = 0;
        
        for ($i = 0; $i < 16; $i++) {
            // Fill bit buffer if needed
            while ($bitCount < 5) {
                if ($byteIndex >= strlen($randomBytes)) {
                    break;
                }
                
                $bitBuffer = ($bitBuffer << 8) | ord($randomBytes[$byteIndex]);
                $bitCount += 8;
                $byteIndex++;
            }
            
            // Extract 5 bits for Base32 character
            $bitCount -= 5;
            $index = ($bitBuffer >> $bitCount) & 0x1f;
            $random[$i] = self::ALPHABET[$index];
        }
        
        return implode('', $random);
    }

    /**
     * Validate ULID format
     * 
     * Checks if a string is a valid ULID (26 characters, valid Base32)
     * 
     * @param string $ulid The ULID to validate
     * @return bool True if valid, false otherwise
     * 
     * @example
     * Ulid::isValid('01arkvgvjg69r8jfq69r8jfq'); // true
     * Ulid::isValid('invalid'); // false
     */
    public static function isValid(string $ulid): bool
    {
        // Check length
        if (strlen($ulid) !== 26) {
            return false;
        }
        
        // Check if all characters are valid Base32
        $ulid = strtoupper($ulid);
        for ($i = 0; $i < 26; $i++) {
            if (strpos(self::ALPHABET, $ulid[$i]) === false) {
                return false;
            }
        }
        
        return true;
    }
}