<?php
declare(strict_types=1);

namespace Services;

use Core\Logger;
use Throwable;

/**
 * Service responsible for determining geographic location data from IP addresses.
 */
final class IpLocationService
{
  /**
   * Retrieves approximate city and country based on the provided IP address.
   *
   * @param string $ip The IPv4 or IPv6 address to locate.
   * @return string A formatted string containing the location (e.g., "San José, Costa Rica").
   */
  public static function getFromIp(string $ip): string
  {
    if ($ip === '127.0.0.1' || $ip === '::1') {
      return 'Local Network';
    }

    try {
      $ch = curl_init("http://ip-api.com/json/{$ip}?fields=city,country,status");
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_TIMEOUT, 2);
      $response = curl_exec($ch);
      curl_close($ch);

      if ($response) {
        $data = json_decode($response, true);
        if (isset($data['status']) && $data['status'] === 'success') {
          return (
            $data['city'] ?? 'Unknown City') . ', ' . (
              $data['country'] ?? 'Unknown Country'
            );
        }
      }
    } catch (Throwable $e) {
      Logger::warning("LocationService failed to resolve IP {$ip}: " . $e->getMessage());
    }

    return 'Ubicación Desconocida';
  }
}