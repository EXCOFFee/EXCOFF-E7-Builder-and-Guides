<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\News;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use DOMDocument;
use DOMXPath;

class SyncNewsCommand extends Command
{
    protected $signature = 'app:sync-news {--source=all : Source to sync (youtube, stove, or all)}';

    protected $description = 'Sync news from YouTube and Stove for Epic Seven';

    private const YOUTUBE_CHANNEL_ID = 'UC3dR_jP_fZ7qH6_-8-VTDNQ'; // Epic Seven official channel @EpicSeven
    private const STOVE_URL = 'https://page.onstove.com/epicseven/global';
    private const STOVE_DOMINIEL_ID = '79157751'; // Official Epic Seven Stove account (Dominiel)

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
            'channelId' => self::YOUTUBE_CHANNEL_ID, // Use the correct channel ID
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
     * Sync news from Stove via Dominiel's profile (official Epic Seven account)
     */
    private function syncStove(): void
    {
        $this->info('Fetching Stove news...');

        try {
            // Method 1: Try the official board API for Epic Seven Global
            $boardApiUrl = 'https://api.onstove.com/cafe/v1/epicseven/global/articles';
            
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept' => 'application/json',
                'Accept-Language' => 'en-US,en;q=0.9',
                'Origin' => 'https://page.onstove.com',
                'Referer' => 'https://page.onstove.com/epicseven/global',
            ])->get($boardApiUrl, [
                'board_key' => 'notice', // Official notices
                'page' => 1,
                'size' => 20,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (is_array($data) && !empty($data)) {
                    $count = $this->processStoveBoardArticles($data);
                    if ($count > 0) {
                        $this->info("Synced {$count} Stove news items from board API");
                        return;
                    }
                }
            }

            // Method 2: Try Dominiel's profile activities
            $this->info('Board API failed, trying Dominiel profile...');
            $activityUrl = 'https://profile.onstove.com/api/v1/member/' . self::STOVE_DOMINIEL_ID . '/activities';
            
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept' => 'application/json',
                'Accept-Language' => 'en-US,en;q=0.9',
                'Referer' => 'https://profile.onstove.com/en/' . self::STOVE_DOMINIEL_ID,
            ])->get($activityUrl, [
                'page' => 1,
                'size' => 20,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (is_array($data) && !empty($data)) {
                    $count = $this->processStoveActivities($data);
                    
                    if ($count > 0) {
                        $this->info("Synced {$count} Stove news items from Dominiel's profile");
                        return;
                    }
                }
            }

            // Method 3: Fallback to page scraping
            $this->info('Activity API failed, trying page scraping...');
            $this->scrapeStoveOfficialPosts();

        } catch (\Exception $e) {
            $this->error('Stove sync error: ' . $e->getMessage());
            Log::error('Stove sync failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Process articles from Stove board API
     */
    private function processStoveBoardArticles(array $data): int
    {
        $count = 0;
        $articles = $data['data']['list'] ?? $data['list'] ?? $data['data']['articles'] ?? $data['articles'] ?? [];

        foreach ($articles as $article) {
            if ($count >= 20) break;

            $title = $article['title'] ?? $article['subject'] ?? null;
            $articleId = $article['article_id'] ?? $article['id'] ?? $article['article_sn'] ?? null;
            
            if (empty($title) || strlen($title) < 5) continue;
            if (empty($articleId)) continue;

            $url = "https://page.onstove.com/epicseven/global/view/{$articleId}";
            $thumbnail = $article['thumbnail'] ?? $article['image'] ?? $article['og_image'] ?? null;
            $publishedAt = $article['created_at'] ?? $article['reg_dt'] ?? $article['write_dt'] ?? null;

            $externalId = 'stove_' . $articleId;

            News::updateOrCreate(
                ['external_id' => $externalId],
                [
                    'title' => substr($title, 0, 255),
                    'description' => substr($article['content'] ?? $article['description'] ?? '', 0, 500) ?: null,
                    'thumbnail' => $thumbnail,
                    'url' => $url,
                    'source' => 'stove',
                    'published_at' => $publishedAt ? Carbon::parse($publishedAt) : now(),
                ]
            );
            $count++;
        }

        return $count;
    }

    /**
     * Process activities from Stove API
     */
    private function processStoveActivities(array $data): int
    {
        $count = 0;
        $activities = $data['data']['list'] ?? $data['list'] ?? $data['data'] ?? [];

        foreach ($activities as $activity) {
            if ($count >= 20) break;

            $title = $activity['title'] ?? $activity['content'] ?? null;
            $url = $activity['url'] ?? $activity['link'] ?? null;
            $thumbnail = $activity['thumbnail'] ?? $activity['image'] ?? null;
            $publishedAt = $activity['created_at'] ?? $activity['reg_dt'] ?? null;

            if (empty($title) || strlen($title) < 5) continue;

            // Generate URL if not provided
            if (empty($url) && isset($activity['board_sn'], $activity['article_sn'])) {
                $url = "https://page.onstove.com/epicseven/global/view/{$activity['article_sn']}";
            }

            if (empty($url)) continue;

            $externalId = 'stove_' . ($activity['article_sn'] ?? md5($url));

            News::updateOrCreate(
                ['external_id' => $externalId],
                [
                    'title' => substr($title, 0, 255),
                    'description' => substr($activity['content'] ?? '', 0, 500) ?: null,
                    'thumbnail' => $thumbnail,
                    'url' => $url,
                    'source' => 'stove',
                    'published_at' => $publishedAt ? Carbon::parse($publishedAt) : now(),
                ]
            );
            $count++;
        }

        return $count;
    }

    /**
     * Scrape official posts from Epic Seven Stove page
     */
    private function scrapeStoveOfficialPosts(): void
    {
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ])->get(self::STOVE_URL);

        if (!$response->successful()) {
            $this->error('Failed to fetch Stove page');
            return;
        }

        $html = $response->body();
        
        // Look for OFFICIAL posts from Dominiel
        preg_match_all('/href=["\']([^"\']*\/view\/(\d+)[^"\']*)["\'][^>]*>.*?(?:OFFICIAL|Dominiel).*?<\/a>/is', $html, $matches);
        
        $count = 0;
        if (!empty($matches[1])) {
            foreach ($matches[1] as $index => $href) {
                if ($count >= 20) break;
                
                if (!str_starts_with($href, 'http')) {
                    $href = 'https://page.onstove.com' . $href;
                }

                // Fetch individual post to get title
                $this->fetchAndSaveStovePost($href, $matches[2][$index] ?? null);
                $count++;
            }
        }

        // If still no posts, try the general news approach
        if ($count === 0) {
            $this->scrapeStoveAlternative($html);
        } else {
            $this->info("Synced {$count} official Stove posts");
        }
    }

    /**
     * Fetch individual Stove post details
     */
    private function fetchAndSaveStovePost(string $url, ?string $articleId): void
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ])->get($url);

            if (!$response->successful()) return;

            $html = $response->body();
            
            // Extract title from page
            preg_match('/<title>([^<]+)<\/title>/i', $html, $titleMatch);
            $title = $titleMatch[1] ?? 'Epic Seven News';
            $title = preg_replace('/\s*[-|]\s*STOVE.*$/i', '', $title);

            // Extract description/content
            preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']/', $html, $descMatch);
            $description = $descMatch[1] ?? null;

            // Extract thumbnail
            preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/', $html, $imgMatch);
            $thumbnail = $imgMatch[1] ?? null;

            $externalId = 'stove_' . ($articleId ?? md5($url));

            News::updateOrCreate(
                ['external_id' => $externalId],
                [
                    'title' => substr(trim($title), 0, 255),
                    'description' => $description ? substr($description, 0, 500) : null,
                    'thumbnail' => $thumbnail,
                    'url' => $url,
                    'source' => 'stove',
                    'published_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            Log::warning('Failed to fetch Stove post: ' . $url, ['error' => $e->getMessage()]);
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
