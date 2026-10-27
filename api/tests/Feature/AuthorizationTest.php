<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Guide;
use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Ownership and admin checks for user-generated content (builds, guides, comments)
 * and the admin-only routes.
 */
class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        // is_admin no es mass assignable: se asigna explícitamente
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    private function makeBuild(User $owner): UserBuild
    {
        return UserBuild::create([
            'user_id' => $owner->id,
            'hero_id' => Hero::factory()->create()->id,
            'title' => 'Speed build',
            'status' => 'published',
            'language' => 'en',
        ]);
    }

    private function makeGuide(User $owner): Guide
    {
        return Guide::create([
            'user_id' => $owner->id,
            'title' => 'RTA basics',
            'slug' => 'rta-basics-' . uniqid(),
            'category' => 'rta',
            'gameplay_content' => 'Content',
            'is_published' => true,
            'language' => 'en',
        ]);
    }

    // ── Builds ───────────────────────────────────────────────────────

    public function test_guest_cannot_create_build(): void
    {
        $hero = Hero::factory()->create();

        $this->postJson('/api/builds', ['hero_id' => $hero->id, 'title' => 'x'])
            ->assertUnauthorized();
    }

    public function test_user_creates_build_owned_by_themselves(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $hero = Hero::factory()->create();

        // user_id del request debe ignorarse: el dueño es siempre el usuario autenticado
        $response = $this->actingAs($user)->postJson('/api/builds', [
            'hero_id' => $hero->id,
            'title' => 'My build',
            'user_id' => $other->id,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('user_builds', ['title' => 'My build', 'user_id' => $user->id]);
    }

    public function test_build_requires_existing_hero(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/builds', ['hero_id' => 999999, 'title' => 'x'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('hero_id');
    }

    public function test_owner_can_update_build(): void
    {
        $owner = User::factory()->create();
        $build = $this->makeBuild($owner);

        $this->actingAs($owner)
            ->putJson("/api/builds/{$build->id}", ['title' => 'Updated'])
            ->assertOk();

        $this->assertSame('Updated', $build->fresh()->title);
    }

    public function test_user_cannot_update_others_build(): void
    {
        $build = $this->makeBuild(User::factory()->create());

        $this->actingAs(User::factory()->create())
            ->putJson("/api/builds/{$build->id}", ['title' => 'Hacked'])
            ->assertForbidden();

        $this->assertSame('Speed build', $build->fresh()->title);
    }

    public function test_user_cannot_delete_others_build(): void
    {
        $build = $this->makeBuild(User::factory()->create());

        $this->actingAs(User::factory()->create())
            ->deleteJson("/api/builds/{$build->id}")
            ->assertForbidden();

        $this->assertModelExists($build);
    }

    public function test_admin_can_delete_any_build(): void
    {
        $build = $this->makeBuild(User::factory()->create());

        $this->actingAs($this->makeAdmin())
            ->deleteJson("/api/builds/{$build->id}")
            ->assertOk();

        $this->assertModelMissing($build);
    }

    // ── Guides ───────────────────────────────────────────────────────

    public function test_user_cannot_update_others_guide(): void
    {
        $guide = $this->makeGuide(User::factory()->create());

        $this->actingAs(User::factory()->create())
            ->putJson("/api/guides/{$guide->slug}", ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_owner_can_delete_guide(): void
    {
        $owner = User::factory()->create();
        $guide = $this->makeGuide($owner);

        $this->actingAs($owner)
            ->deleteJson("/api/guides/{$guide->slug}")
            ->assertOk();

        $this->assertModelMissing($guide);
    }

    public function test_admin_can_delete_any_guide(): void
    {
        $guide = $this->makeGuide(User::factory()->create());

        $this->actingAs($this->makeAdmin())
            ->deleteJson("/api/guides/{$guide->slug}")
            ->assertOk();

        $this->assertModelMissing($guide);
    }

    // ── Comments ─────────────────────────────────────────────────────

    public function test_comment_html_is_stripped(): void
    {
        $user = User::factory()->create();
        $build = $this->makeBuild($user);

        $this->actingAs($user)->postJson('/api/comments', [
            'type' => 'build',
            'id' => $build->id,
            'content' => '<script>alert(1)</script>Nice build',
        ])->assertCreated()->assertJsonPath('content', 'alert(1)Nice build');
    }

    public function test_comment_on_missing_target_is_rejected(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/api/comments', [
            'type' => 'build',
            'id' => 999999,
            'content' => 'Hello',
        ])->assertUnprocessable();
    }

    public function test_reply_to_comment_from_another_build_is_rejected(): void
    {
        $user = User::factory()->create();
        $buildA = $this->makeBuild($user);
        $buildB = $this->makeBuild($user);
        $parent = Comment::create(['user_id' => $user->id, 'build_id' => $buildA->id, 'content' => 'A']);

        $this->actingAs($user)->postJson('/api/comments', [
            'type' => 'build',
            'id' => $buildB->id,
            'content' => 'Reply',
            'parent_id' => $parent->id,
        ])->assertUnprocessable();
    }

    public function test_user_cannot_delete_others_comment(): void
    {
        $build = $this->makeBuild(User::factory()->create());
        $comment = Comment::create([
            'user_id' => $build->user_id,
            'build_id' => $build->id,
            'content' => 'Mine',
        ]);

        $this->actingAs(User::factory()->create())
            ->deleteJson("/api/comments/{$comment->id}")
            ->assertForbidden();
    }

    public function test_comment_cannot_be_edited_after_24_hours(): void
    {
        $owner = User::factory()->create();
        $build = $this->makeBuild($owner);
        $comment = Comment::create([
            'user_id' => $owner->id,
            'build_id' => $build->id,
            'content' => 'Original',
        ]);

        $this->travel(25)->hours();

        $this->actingAs($owner)
            ->putJson("/api/comments/{$comment->id}", ['content' => 'Edited'])
            ->assertUnprocessable();
    }

    // ── Admin routes ─────────────────────────────────────────────────

    public function test_guest_cannot_access_admin_routes(): void
    {
        $this->getJson('/api/admin/sync/status')->assertUnauthorized();
    }

    public function test_regular_user_cannot_access_admin_routes(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/admin/reports')
            ->assertForbidden();
    }

    public function test_admin_can_list_reports(): void
    {
        $this->actingAs($this->makeAdmin())
            ->getJson('/api/admin/reports')
            ->assertOk();
    }
}
