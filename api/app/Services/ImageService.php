<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * Image Validation and Processing Service
 * 
 * SOLID: Single Responsibility - Only handles image validation and processing
 * DRY: Centralized image handling logic used across controllers
 */
class ImageService
{
    /**
     * Maximum file size in bytes (5MB)
     */
    private const MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * Maximum image dimensions
     */
    private const MAX_WIDTH = 2048;
    private const MAX_HEIGHT = 2048;

    /**
     * Allowed MIME types (verified by actual file content, not extension)
     */
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    /**
     * Validate and store an uploaded image.
     * 
     * @param UploadedFile $file The uploaded file
     * @param string $directory Storage directory (e.g., 'builds', 'guides')
     * @return array{success: bool, path?: string, url?: string, error?: string}
     */
    public function validateAndStore(UploadedFile $file, string $directory): array
    {
        // Validate file exists and is valid
        if (!$file->isValid()) {
            return ['success' => false, 'error' => 'Invalid file upload'];
        }

        // Validate file size
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return ['success' => false, 'error' => 'File too large (max 5MB)'];
        }

        // Validate MIME type by actual content (not extension)
        $mimeType = $file->getMimeType();
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            return ['success' => false, 'error' => 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'];
        }

        // Validate image dimensions
        $dimensions = $this->getImageDimensions($file);
        if ($dimensions === null) {
            return ['success' => false, 'error' => 'Could not read image dimensions'];
        }

        if ($dimensions['width'] > self::MAX_WIDTH || $dimensions['height'] > self::MAX_HEIGHT) {
            return ['success' => false, 'error' => 'Image too large (max 2048x2048)'];
        }

        // Generate safe filename
        $safeName = $this->generateSafeFilename($file);

        // Store file
        $path = $file->storeAs($directory, $safeName, 'public');

        if (!$path) {
            return ['success' => false, 'error' => 'Failed to store file'];
        }

        $baseUrl = rtrim(config('app.url'), '/');

        return [
            'success' => true,
            'path' => $path,
            'url' => $baseUrl . '/storage/' . $path,
        ];
    }

    /**
     * Process multiple image uploads.
     * 
     * @param array<UploadedFile> $files
     * @param string $directory
     * @param int $maxImages Maximum number of images to process
     * @return array{urls: string[], errors: string[]}
     */
    public function processMultiple(array $files, string $directory, int $maxImages = 5): array
    {
        $urls = [];
        $errors = [];
        $count = 0;

        foreach ($files as $file) {
            if ($count >= $maxImages) {
                break;
            }

            if (!$file instanceof UploadedFile) {
                continue;
            }

            $result = $this->validateAndStore($file, $directory);

            if ($result['success']) {
                $urls[] = $result['url'];
                $count++;
            } else {
                $errors[] = $result['error'];
            }
        }

        return ['urls' => $urls, 'errors' => $errors];
    }

    /**
     * Get image dimensions.
     * 
     * @return array{width: int, height: int}|null
     */
    private function getImageDimensions(UploadedFile $file): ?array
    {
        $path = $file->getPathname();
        $size = @getimagesize($path);

        if ($size === false) {
            return null;
        }

        return [
            'width' => $size[0],
            'height' => $size[1],
        ];
    }

    /**
     * Generate a safe, unique filename.
     */
    private function generateSafeFilename(UploadedFile $file): string
    {
        $extension = $file->guessExtension() ?? 'jpg';
        $timestamp = now()->format('Ymd_His');
        $random = Str::random(8);

        return "{$timestamp}_{$random}.{$extension}";
    }
}
