<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\News;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use DOMDocument;
use DOMXPath;

class SyncNewsCommand extends Command
{
    protected $signature = 'app:sync-news {--source=all : Source to sync (youtube, stove, or all)}';

    protected $description = 'Sync news from YouTube and Stove for Epic Seven';

    private const YOUTUBE_CHANNEL_ID = 'UC3dR_jP_fZ7qH6_-8-VTDNQ'; // Epic Seven official channel @EpicSeven
    private const STOVE_URL = 'https://page.onstove.com/epicseven/global';

    public function handle(): int
    {
        $source = $this->option('source');

        $this->info('Starting news sync...');

        if ($source === 'all' || $source === 'youtube') {
            $this->syncYouTube();
        }

        if ($source === 'all' || $source === 'stove') {
            $this->syncStove();
        }

        $this->info('News sync completed!');
        return Command::SUCCESS;
    }

    /**
     * Sync news from YouTube using Data API v3
     */
    private function syncYouTube(): void
    {
        $this->info('Syncing YouTube videos...');

        $apiKey = config('services.youtube.api_key');
        if (empty($apiKey)) {
            $this->error('YouTube API key not configured. Add YOUTUBE_API_KEY to .env');
            return;
        }

        try {
            // Get channel's uploads playlist ID first
            $channelResponse = Http::get('https://www.googleapis.com/youtube/v3/channels', [
                'part' => 'contentDetails',
                'forUsername' => 'EpicSeven', // Try by username first
                'key' => $apiKey,
            ]);

            $uploadsPlaylistId = null;
            
            // If username doesn't work, try by channel handle
            if (!$channelResponse->successful() || empty($channelResponse->json('items'))) {
                // Search for the channel by handle @EpicSeven
                $searchResponse = Http::get('https://www.googleapis.com/youtube/v3/search', [
                    'part' => 'snippet',
                    'q' => 'Epic Seven official',
                    'type' => 'channel',
                    'maxResults' => 1,
                    'key' => $apiKey,
                ]);

                if ($searchResponse->successful() && !empty($searchResponse->json('items'))) {
                    $channelId = $searchResponse->json('items.0.snippet.channelId');
                    
                    // Get the uploads playlist
                    $channelResponse = Http::get('https://www.googleapis.com/youtube/v3/channels', [
                        'part' => 'contentDetails',
                        'id' => $channelId,
                        'key' => $apiKey,
                    ]);
                }
            }

            if ($channelResponse->successful() && !empty($channelResponse->json('items'))) {
                $uploadsPlaylistId = $channelResponse->json('items.0.contentDetails.relatedPlaylists.uploads');
            }

            if (!$uploadsPlaylistId) {
                // Fallback: Use search API directly
                $this->syncYouTubeViaSearch($apiKey);
                return;
            }

            // Get videos from uploads playlist
            $videosResponse = Http::get('https://www.googleapis.com/youtube/v3/playlistItems', [
                'part' => 'snippet,contentDetails',
                'playlistId' => $uploadsPlaylistId,
                'maxResults' => 20,
                'key' => $apiKey,
            ]);

            if (!$videosResponse->successful()) {
                $this->error('Failed to fetch YouTube videos: ' . $videosResponse->body());
                return;
            }

            $count = 0;
            foreach ($videosResponse->json('items', []) as $item) {
                $videoId = $item['contentDetails']['videoId'] ?? $item['snippet']['resourceId']['videoId'] ?? null;
                
                if (!$videoId) continue;

                News::updateOrCreate(
                    ['external_id' => $videoId],
                    [
                        'title' => $item['snippet']['title'],
                        'description' => substr($item['snippet']['description'] ?? '', 0, 500),
                        'thumbnail' => $item['snippet']['thumbnails']['high']['url'] ?? $item['snippet']['thumbnails']['default']['url'] ?? null,
                        'url' => "https://www.youtube.com/watch?v={$videoId}",
                        'source' => 'youtube',
                        'published_at' => $item['snippet']['publishedAt'] ?? now(),
                    ]
                );
                $count++;
            }

            $this->info("Synced {$count} YouTube videos");
        } catch (\Exception $e) {
            $this->error('YouTube sync error: ' . $e->getMessage());
            Log::error('YouTube sync failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Fallback: Sync YouTube via search API
     */
    private function syncYouTubeViaSearch(string $apiKey): void
    {
        $this->info('Using search API fallback...');

        $response = Http::get('https://www.googleapis.com/youtube/v3/search', [
            'part' => 'snippet',
            'channelId' => 'UCkpN8M6C2wELDLx7XKUlL7Q', // Epic Seven channel ID
            'type' => 'video',
            'order' => 'date',
            'maxResults' => 20,
            'key' => $apiKey,
        ]);

        if (!$response->successful()) {
            $this->error('Failed to search YouTube: ' . $response->body());
            return;
        }

        $count = 0;
        foreach ($response->json('items', []) as $item) {
            $videoId = $item['id']['videoId'] ?? null;
            if (!$videoId) continue;

            News::updateOrCreate(
                ['external_id' => $videoId],
                [
                    'title' => $item['snippet']['title'],
                    'description' => substr($item['snippet']['description'] ?? '', 0, 500),
                    'thumbnail' => $item['snippet']['thumbnails']['high']['url'] ?? $item['snippet']['thumbnails']['default']['url'] ?? null,
                    'url' => "https://www.youtube.com/watch?v={$videoId}",
                    'source' => 'youtube',
                    'published_at' => $item['snippet']['publishedAt'] ?? now(),
                ]
            );
            $count++;
        }

        $this->info("Synced {$count} YouTube videos via search");
    }

    /**
     * Sync news from Stove via web scraping
     */
    private function syncStove(): void
    {
        $this->info('Scraping Stove news...');

        try {
            // Fetch the main news page
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'en-US,en;q=0.5',
            ])->get(self::STOVE_URL);

            if (!$response->successful()) {
                $this->error('Failed to fetch Stove page: ' . $response->status());
                return;
            }

            $html = $response->body();
            
            // Parse HTML
            libxml_use_internal_errors(true);
            $doc = new DOMDocument();
            $doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
            $xpath = new DOMXPath($doc);

            // Find news/notice items (adjust selectors based on actual page structure)
            // Common patterns: .article-list, .notice-list, .board-list, etc.
            $newsItems = $xpath->query("//div[contains(@class, 'article') or contains(@class, 'notice') or contains(@class, 'list-item')]//a");

            $count = 0;
            foreach ($newsItems as $item) {
                if ($count >= 20) break; // Limit to 20 items

                $href = $item->getAttribute('href');
                $title = trim($item->textContent);

                if (empty($href) || empty($title) || strlen($title) < 5) continue;

                // Create full URL if relative
                if (!str_starts_with($href, 'http')) {
                    $href = 'https://page.onstove.com' . $href;
                }

                // Use URL hash as external_id
                $externalId = 'stove_' . md5($href);

                News::updateOrCreate(
                    ['external_id' => $externalId],
                    [
                        'title' => substr($title, 0, 255),
                        'description' => null,
                        'thumbnail' => null, // Stove doesn't have easy thumbnails
                        'url' => $href,
                        'source' => 'stove',
                        'published_at' => now(), // We don't have exact date from listing
                    ]
                );
                $count++;
            }

            // If no items found with the generic selectors, try alternative approach
            if ($count === 0) {
                $this->warn('No news found with default selectors, trying alternative...');
                $this->scrapeStoveAlternative($html);
            } else {
                $this->info("Synced {$count} Stove news items");
            }
        } catch (\Exception $e) {
            $this->error('Stove sync error: ' . $e->getMessage());
            Log::error('Stove sync failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Alternative Stove scraping approach
     */
    private function scrapeStoveAlternative(string $html): void
    {
        // Try to find links with epicseven in the URL
        preg_match_all('/<a[^>]+href=["\']([^"\']*epicseven[^"\']*)["\'][^>]*>([^<]+)</i', $html, $matches);

        $count = 0;
        if (!empty($matches[1])) {
            foreach ($matches[1] as $index => $href) {
                if ($count >= 20) break;
                
                $title = trim(strip_tags($matches[2][$index] ?? ''));
                if (empty($title) || strlen($title) < 5) continue;

                if (!str_starts_with($href, 'http')) {
                    $href = 'https://page.onstove.com' . $href;
                }

                $externalId = 'stove_' . md5($href);

                News::updateOrCreate(
                    ['external_id' => $externalId],
                    [
                        'title' => substr($title, 0, 255),
                        'description' => null,
                        'thumbnail' => null,
                        'url' => $href,
                        'source' => 'stove',
                        'published_at' => now(),
                    ]
                );
                $count++;
            }
        }

        $this->info("Synced {$count} Stove news items (alternative method)");
    }
}
