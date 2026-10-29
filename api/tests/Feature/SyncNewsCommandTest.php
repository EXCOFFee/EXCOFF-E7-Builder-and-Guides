<?php

namespace Tests\Feature;

use App\Models\News;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * app:sync-news con YouTube y Stove simulados: guarda las noticias, no duplica al repetir
 * y recorta textos largos sin partir caracteres UTF-8 (antes MySQL rechazaba la fila).
 */
class SyncNewsCommandTest extends TestCase
{
    use RefreshDatabase;

    private function fakeSources(string $stoveTitle): void
    {
        config(['services.youtube.api_key' => 'test-key']);

        Http::fake([
            'www.googleapis.com/youtube/v3/channels*' => Http::response([
                'items' => [[
                    'snippet' => ['title' => 'Epic Seven'],
                    'contentDetails' => ['relatedPlaylists' => ['uploads' => 'UU123']],
                ]],
            ]),
            'www.googleapis.com/youtube/v3/playlistItems*' => Http::response([
                'items' => [[
                    'contentDetails' => ['videoId' => 'vid1'],
                    'snippet' => [
                        'title' => 'E7WC 2026 — Knockout Stage',
                        'description' => 'Watch live',
                        'thumbnails' => ['high' => ['url' => 'https://i.ytimg.com/vi/vid1/hqdefault.jpg']],
                        'publishedAt' => '2026-10-27T09:00:00Z',
                    ],
                ]],
            ]),
            'api.onstove.com/cwms/v3.0/article_group/BOARD/985/*' => Http::response([
                'value' => ['list' => [[
                    'article_id' => 555,
                    'title' => $stoveTitle,
                    'summary' => str_repeat('Patch’s summary — ', 60),
                    'media_thumbnail_url' => '//cdn.onstove.com/thumb.png',
                    'create_datetime' => 1793200000000,
                ]]],
            ]),
            'api.onstove.com/*' => Http::response(['value' => ['list' => []]]),
        ]);
    }

    public function test_syncs_youtube_and_stove_without_duplicates(): void
    {
        $this->fakeSources('Ver. 1.2.3 Patch Notes');

        $this->artisan('app:sync-news')->assertSuccessful();
        $this->artisan('app:sync-news')->assertSuccessful();

        $this->assertSame(1, News::where('source', 'youtube')->count());
        $this->assertSame(1, News::where('source', 'stove')->count());

        $stove = News::where('source', 'stove')->first();
        $this->assertSame('https://page.onstove.com/epicseven/global/view/555', $stove->url);
        $this->assertSame('https://cdn.onstove.com/thumb.png', $stove->thumbnail);
        $this->assertSame('news', $stove->category);
    }

    public function test_long_texts_are_cut_on_character_boundaries(): void
    {
        // El carácter 255 es "—" (3 bytes): substr lo partía y dejaba UTF-8 inválido
        $title = str_repeat('a', 254) . '—' . str_repeat('b', 20);
        $this->fakeSources($title);

        $this->artisan('app:sync-news', ['--source' => 'stove'])->assertSuccessful();

        $news = News::where('source', 'stove')->firstOrFail();
        $this->assertTrue(mb_check_encoding($news->title, 'UTF-8'));
        $this->assertTrue(mb_check_encoding($news->description, 'UTF-8'));
        $this->assertSame(255, mb_strlen($news->title));
        $this->assertStringEndsWith('—', $news->title);
        $this->assertLessThanOrEqual(500, mb_strlen($news->description));
    }

    public function test_news_sync_is_scheduled_hourly(): void
    {
        $event = collect(app(Schedule::class)->events())
            ->first(fn ($e) => str_contains($e->command ?? '', 'app:sync-news'));

        $this->assertNotNull($event, 'app:sync-news no está en el scheduler');
        $this->assertSame('15 * * * *', $event->expression);
    }
}
