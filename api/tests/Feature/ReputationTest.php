<?php

namespace Tests\Feature;

use App\Models\Guide;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Reputación: perfil público (sin email ni nada anónimo), seguir y feed, builds verificadas
 * (captura + revisión del admin, con la lectura del OCR para ordenar la cola) e insignias.
 */
class ReputationTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    private function proof(): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'proof') . '.png';
        file_put_contents($path, base64_decode(self::PNG));

        return new UploadedFile($path, 'proof.png', 'image/png', null, true);
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    public function test_profile_shows_public_work_without_email_or_anonymous_items(): void
    {
        $user = User::factory()->create(['name' => 'Builder']);
        UserBuild::factory()->create(['user_id' => $user->id, 'likes' => 7]);
        UserBuild::factory()->anonymous()->create(['user_id' => $user->id, 'likes' => 50]);
        UserBuild::factory()->draft()->create(['user_id' => $user->id, 'likes' => 50]);
        Guide::factory()->create(['user_id' => $user->id, 'likes' => 3]);
        Guide::factory()->create(['user_id' => $user->id, 'likes' => 40, 'is_anonymous' => true]);

        $profile = $this->getJson("/api/users/{$user->id}")->assertOk()->json();

        $this->assertSame('Builder', $profile['name']);
        $this->assertArrayNotHasKey('email', $profile);
        $this->assertSame(1, $profile['stats']['builds']);
        $this->assertSame(1, $profile['stats']['guides']);
        $this->assertSame(10, $profile['stats']['likes_received']);
        $this->assertSame([], $profile['badges']);

        $listed = $this->getJson("/api/builds?user={$user->id}")->json('data');
        $this->assertCount(1, $listed);
        $this->assertCount(1, $this->getJson("/api/guides?user={$user->id}")->json('data'));
    }

    public function test_anonymous_guides_hide_the_author(): void
    {
        $user = User::factory()->create();
        $guide = $this->actingAs($user, 'sanctum')->postJson('/api/guides', [
            'title' => 'Secret tech', 'category' => 'rta', 'gameplay_content' => 'x', 'is_anonymous' => '1',
        ])->assertCreated()->json();

        $shown = $this->getJson("/api/guides/{$guide['slug']}")->json();
        $this->assertNull($shown['user']);
        $this->assertArrayNotHasKey('user_id', $shown);
    }

    public function test_follow_unfollow_and_feed(): void
    {
        $me = User::factory()->create();
        $followed = User::factory()->create();
        $other = User::factory()->create();
        UserBuild::factory()->create(['user_id' => $followed->id, 'title' => 'From followed']);
        UserBuild::factory()->anonymous()->create(['user_id' => $followed->id, 'title' => 'Anonymous one']);
        Guide::factory()->create(['user_id' => $followed->id, 'title' => 'Guide from followed']);
        UserBuild::factory()->create(['user_id' => $other->id, 'title' => 'Not followed']);

        $this->postJson("/api/users/{$followed->id}/follow")->assertUnauthorized();
        $this->actingAs($me, 'sanctum')->postJson("/api/users/{$me->id}/follow")->assertStatus(422);
        $this->actingAs($me, 'sanctum')->postJson("/api/users/{$followed->id}/follow")->assertOk()->assertJsonPath('following', true);
        $this->actingAs($me, 'sanctum')->postJson("/api/users/{$followed->id}/follow")->assertOk();
        $this->assertSame(1, DB::table('follows')->count());

        $this->actingAs($me, 'sanctum')->getJson("/api/users/{$followed->id}")
            ->assertJsonPath('is_following', true)
            ->assertJsonPath('stats.followers', 1);

        $titles = collect($this->actingAs($me, 'sanctum')->getJson('/api/feed')->assertOk()->json('items'))->pluck('title')->sort()->values()->all();
        $this->assertSame(['From followed', 'Guide from followed'], $titles);

        $this->actingAs($me, 'sanctum')->deleteJson("/api/users/{$followed->id}/follow")->assertOk()->assertJsonPath('following', false);
        $this->assertSame(0, DB::table('follows')->count());
    }

    public function test_proof_with_ocr_goes_to_review_and_admin_approves(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create();
        $stats = ['atk' => 3909, 'def' => 1023, 'hp' => 12194, 'spd' => 269, 'crit_chance' => 15, 'crit_dmg' => 155, 'eff' => 95, 'res' => 7];

        $build = $this->actingAs($owner, 'sanctum')->post('/api/builds', [
            'hero_id' => \App\Models\Hero::factory()->create()->id,
            'title' => 'Verified one',
            'min_stats' => json_encode($stats),
            'proof_image' => $this->proof(),
            'proof_ocr' => json_encode(array_merge($stats, ['spd' => 268, 'res' => 70])),
        ], ['Accept' => 'application/json'])->assertCreated()->json();

        $saved = UserBuild::find($build['id']);
        $this->assertSame('pending', $saved->verification_status);
        $this->assertSame(['matched' => 7, 'total' => 8], array_intersect_key($saved->proof_ocr, ['matched' => 1, 'total' => 1]));
        $this->assertArrayNotHasKey('proof_ocr', $build, 'la lectura del OCR no es pública');

        $this->actingAs($owner, 'sanctum')->getJson('/api/admin/verifications')->assertForbidden();

        $admin = $this->admin();
        $queue = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/verifications')->assertOk()->json('data');
        $this->assertSame($build['id'], $queue[0]['id']);

        $this->actingAs($admin, 'sanctum')->putJson('/api/admin/verifications', ['ids' => [$build['id']], 'status' => 'verified'])->assertOk();
        $this->assertSame('verified', UserBuild::find($build['id'])->verification_status);
        $this->assertCount(1, $this->getJson('/api/builds?verified=1')->json('data'));
    }

    public function test_queue_puts_matching_screenshots_first(): void
    {
        $low = UserBuild::factory()->create(['proof_image' => 'x.png']);
        $high = UserBuild::factory()->create(['proof_image' => 'y.png']);
        $none = UserBuild::factory()->create(['proof_image' => 'z.png']);
        DB::table('user_builds')->where('id', $low->id)->update(['verification_status' => 'pending', 'proof_ocr' => json_encode(['matched' => 2, 'total' => 8])]);
        DB::table('user_builds')->where('id', $high->id)->update(['verification_status' => 'pending', 'proof_ocr' => json_encode(['matched' => 8, 'total' => 8])]);
        DB::table('user_builds')->where('id', $none->id)->update(['verification_status' => 'pending']);

        $ids = collect($this->actingAs($this->admin(), 'sanctum')->getJson('/api/admin/verifications')->json('data'))->pluck('id')->all();
        $this->assertSame([$high->id, $low->id, $none->id], $ids);
    }

    public function test_changing_stats_sends_a_verified_build_back_to_review(): void
    {
        $owner = User::factory()->create();
        $build = UserBuild::factory()->create(['user_id' => $owner->id, 'proof_image' => 'p.png', 'min_stats' => ['spd' => 200]]);
        DB::table('user_builds')->where('id', $build->id)->update(['verification_status' => 'verified', 'verified_at' => now()]);

        $this->actingAs($owner, 'sanctum')->putJson("/api/builds/{$build->id}", ['title' => 'Renamed'])->assertOk();
        $this->assertSame('verified', $build->fresh()->verification_status, 'cambiar el título no la saca');

        $this->actingAs($owner, 'sanctum')->putJson("/api/builds/{$build->id}", ['min_stats' => json_encode(['spd' => 300])])->assertOk();
        $this->assertSame('pending', $build->fresh()->verification_status);
        $this->assertNull($build->fresh()->verified_at);

        $this->actingAs($owner, 'sanctum')->putJson("/api/builds/{$build->id}", ['remove_proof_image' => true])->assertOk();
        $this->assertNull($build->fresh()->verification_status);
    }

    public function test_badges(): void
    {
        $user = User::factory()->create();
        $builds = UserBuild::factory()->count(5)->create(['user_id' => $user->id, 'likes' => 20, 'proof_image' => 'p.png']);
        DB::table('user_builds')->whereIn('id', $builds->pluck('id'))->update(['verification_status' => 'verified']);

        $profile = $this->getJson("/api/users/{$user->id}")->json();
        $this->assertSame(5, $profile['stats']['verified_builds']);
        $this->assertSame(['verified_builder', 'popular'], $profile['badges']);
    }
}
