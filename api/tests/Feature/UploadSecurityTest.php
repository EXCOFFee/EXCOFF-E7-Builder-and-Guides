<?php

namespace Tests\Feature;

use App\Models\Guide;
use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Uploaded images must be real images (checked by content) and image_urls may only
 * reference files already stored on this server.
 */
class UploadSecurityTest extends TestCase
{
    use RefreshDatabase;

    private const PHP_PAYLOAD = '<?php echo "pwned"; ?>';

    // PNG real de 1x1 (no depende de la extensión GD)
    private const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        config(['app.url' => 'https://api.example.test']);
    }

    private function guidePayload(array $extra = []): array
    {
        return array_merge([
            'title' => 'RTA basics',
            'category' => 'rta',
            'gameplay_content' => 'Content',
        ], $extra);
    }

    private function guildPayload(array $extra = []): array
    {
        return array_merge([
            'title' => 'Recruiting',
            'description' => 'Active guild',
            'server' => \App\Models\GuildPost::SERVERS[0],
            'language' => \App\Models\GuildPost::LANGUAGES[0],
        ], $extra);
    }

    private function assertNothingStored(string $directory): void
    {
        $this->assertSame([], Storage::disk('public')->allFiles($directory));
    }

    // ── Guides ───────────────────────────────────────────────────────

    public function test_guide_accepts_a_real_image(): void
    {
        $response = $this->actingAs(User::factory()->create())->post('/api/guides', $this->guidePayload([
            'images' => [UploadedFile::fake()->createWithContent('cover.png', base64_decode(self::PNG_1X1))],
        ]), ['Accept' => 'application/json']);

        $response->assertCreated();
        $this->assertCount(1, Storage::disk('public')->allFiles('guides'));
        $this->assertStringStartsWith('https://api.example.test/storage/guides/', $response->json('images.0'));
    }

    public function test_guide_rejects_php_disguised_as_image(): void
    {
        $this->actingAs(User::factory()->create())->post('/api/guides', $this->guidePayload([
            'images' => [UploadedFile::fake()->createWithContent('cover.jpg', self::PHP_PAYLOAD)],
        ]), ['Accept' => 'application/json'])
            // Lo frena la validación por contenido (rule `image` o getimagesize en ImageService)
            ->assertUnprocessable()
            ->assertJsonStructure(['errors']);

        $this->assertNothingStored('guides');
        $this->assertDatabaseCount('guides', 0);
    }

    public function test_guide_update_drops_external_image_urls(): void
    {
        $owner = User::factory()->create();
        $guide = Guide::create([
            'user_id' => $owner->id, 'title' => 'Mine', 'slug' => 'mine-1', 'category' => 'pve',
            'gameplay_content' => 'x', 'is_published' => true, 'language' => 'en',
        ]);
        $own = 'https://api.example.test/storage/guides/old.png';

        $this->actingAs($owner)->putJson("/api/guides/{$guide->slug}", [
            'image_urls' => json_encode([$own, 'https://evil.example/tracker.gif', 'javascript:alert(1)']),
        ])->assertOk();

        $this->assertSame([$own], $guide->fresh()->images);
    }

    // ── Guild posts ──────────────────────────────────────────────────

    public function test_guild_post_rejects_php_disguised_as_image(): void
    {
        $this->actingAs(User::factory()->create())->post('/api/guilds', $this->guildPayload([
            'images' => [UploadedFile::fake()->createWithContent('banner.png', self::PHP_PAYLOAD)],
        ]), ['Accept' => 'application/json'])
            ->assertUnprocessable();

        $this->assertNothingStored('guilds');
        $this->assertDatabaseCount('guild_posts', 0);
    }

    public function test_guild_post_keeps_only_own_image_urls(): void
    {
        $own = 'https://api.example.test/storage/guilds/banner.png';

        $response = $this->actingAs(User::factory()->create())->postJson('/api/guilds', $this->guildPayload([
            'image_urls' => [$own, 'https://evil.example/x.png', 'https://api.example.test/storage/../.env'],
        ]));

        $response->assertCreated();
        $this->assertSame([$own], $response->json('data.images'));
    }

    // ── Builds ───────────────────────────────────────────────────────

    public function test_build_rejects_php_disguised_as_image(): void
    {
        $this->actingAs(User::factory()->create())->post('/api/builds', [
            'hero_id' => Hero::factory()->create()->id,
            'title' => 'Speed build',
            'images' => [UploadedFile::fake()->createWithContent('build.jpg', self::PHP_PAYLOAD)],
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable();

        $this->assertNothingStored('builds');
        $this->assertDatabaseCount('user_builds', 0);
    }

    public function test_build_update_rejects_php_and_keeps_previous_images(): void
    {
        $owner = User::factory()->create();
        $previous = ['https://api.example.test/storage/builds/old.png'];
        $build = UserBuild::create([
            'user_id' => $owner->id, 'hero_id' => Hero::factory()->create()->id,
            'title' => 'Speed build', 'status' => 'published', 'images' => $previous,
        ]);

        $this->actingAs($owner)->post("/api/builds/{$build->id}", [
            '_method' => 'PUT',
            'images' => [UploadedFile::fake()->createWithContent('x.gif', self::PHP_PAYLOAD)],
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable();

        $this->assertSame($previous, $build->fresh()->images);
        $this->assertNothingStored('builds');
    }
}
