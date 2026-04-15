<?php
declare(strict_types=1);

namespace Http;

/**
 * Detects client platform (web browser vs mobile app) based on User-Agent and custom headers.
 * Used to route authentication to appropriate method (cookies vs bearer tokens).
 */
class ClientDetector
{
    // Platform constants
    public const PLATFORM_WEB = 'web';
    public const PLATFORM_MOBILE_ANDROID = 'mobile_android';
    public const PLATFORM_MOBILE_IOS = 'mobile_ios';
    public const PLATFORM_UNKNOWN = 'unknown';

    // User-Agent patterns
    private const ANDROID_PATTERN = '/Android|android-kotlin/i';
    private const IOS_PATTERN = '/(iPad|iPhone|iPod)/i';
    private const MOBILE_PATTERN = '/Mobile|Android|iPhone|iPad|iPod|Kotlin|Flutter|GeoterRA-Mobile/i';
    private const BROWSER_PATTERN = '/(Chrome|Firefox|Safari|Edge|Opera|Chromium)/i';

    private string $userAgent;

    public function __construct(string $userAgent = '')
    {
        $this->userAgent = $userAgent ?: ($_SERVER['HTTP_USER_AGENT'] ?? '');
    }

    /**
     * Get the client platform.
     *
     * @return string One of: PLATFORM_WEB, PLATFORM_MOBILE_ANDROID, PLATFORM_MOBILE_IOS, PLATFORM_UNKNOWN
     */
    public function getPlatform(): string
    {
        // Priority 1: Check for Kotlin app indicators (custom headers)
        if ($this->hasKotlinIndicators()) {
            return self::PLATFORM_MOBILE_ANDROID;
        }

        // Priority 2: Check for iOS
        if (preg_match(self::IOS_PATTERN, $this->userAgent)) {
            return self::PLATFORM_MOBILE_IOS;
        }

        // Priority 3: Check for Android
        if (preg_match(self::ANDROID_PATTERN, $this->userAgent)) {
            return self::PLATFORM_MOBILE_ANDROID;
        }

        // Priority 4: Check if it's a generic mobile device
        if (preg_match(self::MOBILE_PATTERN, $this->userAgent)) {
            return self::PLATFORM_MOBILE_ANDROID; // Assume Android if unclear
        }

        // Priority 5: Check if it's a browser
        if (preg_match(self::BROWSER_PATTERN, $this->userAgent)) {
            return self::PLATFORM_WEB;
        }

        return self::PLATFORM_UNKNOWN;
    }

    /**
     * Check if client is a mobile app.
     */
    public function isMobileApp(): bool
    {
        $platform = $this->getPlatform();
        return $platform === self::PLATFORM_MOBILE_ANDROID ||
               $platform === self::PLATFORM_MOBILE_IOS;
    }

    /**
     * Check if client is a web browser.
     */
    public function isWebBrowser(): bool
    {
        return $this->getPlatform() === self::PLATFORM_WEB;
    }

    /**
     * Check for Kotlin app indicators via custom headers.
     * Apps should send custom headers like:
     * - X-App-Platform: android-kotlin
     * - X-App-Name: GeoterRA
     * - X-App-Version: 1.0.0
     */
    private function hasKotlinIndicators(): bool
    {
        $appPlatform = $_SERVER['HTTP_X_APP_PLATFORM'] ?? '';
        $appVersion = $_SERVER['HTTP_X_APP_VERSION'] ?? '';
        $appName = $_SERVER['HTTP_X_APP_NAME'] ?? '';

        return !empty($appPlatform) || !empty($appVersion) || !empty($appName);
    }

    /**
     * Get app version (if mobile app).
     */
    public function getAppVersion(): ?string
    {
        return $_SERVER['HTTP_X_APP_VERSION'] ?? null;
    }

    /**
     * Get app name (if mobile app).
     */
    public function getAppName(): ?string
    {
        return $_SERVER['HTTP_X_APP_NAME'] ?? null;
    }

    /**
     * Get app platform (if mobile app).
     */
    public function getAppPlatform(): ?string
    {
        return $_SERVER['HTTP_X_APP_PLATFORM'] ?? null;
    }

    /**
     * Get detailed platform info for logging and debugging.
     */
    public function getPlatformInfo(): array
    {
        return [
            'platform' => $this->getPlatform(),
            'user_agent' => $this->userAgent,
            'is_mobile' => $this->isMobileApp(),
            'is_web' => $this->isWebBrowser(),
            'app_name' => $this->getAppName(),
            'app_platform' => $this->getAppPlatform(),
            'app_version' => $this->getAppVersion(),
        ];
    }
}