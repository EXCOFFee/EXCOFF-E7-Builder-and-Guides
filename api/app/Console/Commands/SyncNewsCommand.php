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
    protected $signature = 'app:sync-news {--source=all : Source to sync (youtube, stove, or all)} {--clear : Clear all news before syncing}';

    protected $description = 'Sync news from YouTube and Stove for Epic Seven';

    private const YOUTUBE_CHANNEL_ID = 'UCa1C3tWzsn4FFRR7t3LqU5w'; // @EpicSeven official channel
    private const STOVE_URL = 'https://page.onstove.com/epicseven/global';
    private const STOVE_DOMINIEL_ID = '79157751'; // Official Epic Seven Stove account (Dominiel)

    public function handle(): int
    {
        $source = $this->option('source');
        $clear = $this->option('clear');

        $this->info('Starting news sync...');

        // Clear existing news if requested
        if ($clear) {
            $this->info('Clearing existing news...');
            if ($source === 'all') {
                $deleted = News::query()->delete();
            } elseif ($source === 'youtube') {
                $deleted = News::where('source', 'youtube')->delete();
            } elseif ($source === 'stove') {
                $deleted = News::where('source', 'stove')->delete();
            } else {
                $deleted = 0;
            }
            $this->info("Deleted {$deleted} existing news items");
        }

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
        $this->info('Using Channel ID: ' . self::YOUTUBE_CHANNEL_ID);

        $apiKey = config('services.youtube.api_key');
        if (empty($apiKey)) {
            $this->error('YouTube API key not configured. Add YOUTUBE_API_KEY to .env');
            return;
        }

        try {
            // Direct approach: Get channel's uploads playlist using our known Channel ID
            $channelResponse = Http::get('https://www.googleapis.com/youtube/v3/channels', [
                'part' => 'contentDetails,snippet',
                'id' => self::YOUTUBE_CHANNEL_ID,
                'key' => $apiKey,
            ]);

            if (!$channelResponse->successful()) {
                $this->error('Failed to fetch channel info: ' . $channelResponse->body());
                $this->syncYouTubeViaSearch($apiKey);
                return;
            }

            $channelData = $channelResponse->json();
            
            if (empty($channelData['items'])) {
                $this->error('Channel not found with ID: ' . self::YOUTUBE_CHANNEL_ID);
                $this->syncYouTubeViaSearch($apiKey);
                return;
            }

            $channelTitle = $channelData['items'][0]['snippet']['title'] ?? 'Unknown';
            $this->info("Found channel: {$channelTitle}");
            
            $uploadsPlaylistId = $channelData['items'][0]['contentDetails']['relatedPlaylists']['uploads'] ?? null;

            if (!$uploadsPlaylistId) {
                $this->error('Could not get uploads playlist ID');
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
     * Sync news from Stove official boards
     * Board IDs: 985 (News), 988 (Events), 986 (Patch Notes), 987 (Dev Notes)
     */
    private function syncStove(): void
    {
        $this->info('Fetching Stove news...');

        // Official board IDs for Epic Seven Global (Channel 126)
        $boardIds = [
            985 => 'News',
            988 => 'Events', 
            986 => 'Patch Notes',
            987 => 'Dev Notes',
        ];

        $totalCount = 0;

        foreach ($boardIds as $boardId => $boardName) {
            try {
                $this->info("Fetching {$boardName} (Board {$boardId})...");
                
                $apiUrl = "https://api.onstove.com/cwms/v3.0/article_group/BOARD/{$boardId}/article/list";
                
                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept' => 'application/json',
                    'Accept-Language' => 'en-US,en;q=0.9',
                    'Referer' => 'https://page.onstove.com/epicseven/global',
                ])->get($apiUrl, [
                    'interaction_type_code' => 'LIKE,DISLIKE,COMMENT,VIEW',
                    'content_yn' => 'Y',
                    'summary_yn' => 'Y',
                    'sort_type_code' => 'LATEST',
                    'translation_yn' => 'Y',
                    'page' => 1,
                    'size' => 10,
                ]);

                if (!$response->successful()) {
                    $this->warn("Failed to fetch {$boardName}: " . $response->status());
                    continue;
                }

                $data = $response->json();
                $articles = $data['value']['list'] ?? [];
                
                if (empty($articles)) {
                    $this->info("No articles found in {$boardName}");
                    continue;
                }

                $count = 0;
                foreach ($articles as $article) {
                    $articleId = $article['article_id'] ?? null;
                    $title = $article['title'] ?? null;
                    
                    if (!$articleId || !$title) continue;

                    // Build thumbnail URL (needs https: prefix)
                    $thumbnail = $article['media_thumbnail_url'] ?? null;
                    if ($thumbnail && !str_starts_with($thumbnail, 'http')) {
                        $thumbnail = 'https:' . $thumbnail;
                    }

                    // Parse timestamp (milliseconds)
                    $publishedAt = null;
                    if (!empty($article['create_datetime'])) {
                        try {
                            $publishedAt = Carbon::createFromTimestampMs($article['create_datetime']);
                        } catch (\Exception $e) {
                            $publishedAt = now();
                        }
                    }

                    News::updateOrCreate(
                        ['external_id' => 'stove_' . $articleId],
                        [
                            'title' => substr($title, 0, 255),
                            'description' => substr($article['summary'] ?? '', 0, 500) ?: null,
                            'thumbnail' => $thumbnail,
                            'url' => "https://page.onstove.com/epicseven/global/view/{$articleId}",
                            'source' => 'stove',
                            'published_at' => $publishedAt ?? now(),
                        ]
                    );
                    $count++;
                }

                $this->info("Synced {$count} items from {$boardName}");
                $totalCount += $count;

            } catch (\Exception $e) {
                $this->error("Error fetching {$boardName}: " . $e->getMessage());
                Log::error("Stove sync error for board {$boardId}", ['error' => $e->getMessage()]);
            }
        }

        $this->info("Total Stove news synced: {$totalCount}");
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
