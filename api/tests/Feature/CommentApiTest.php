<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Guide;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Comentarios de builds y guías: publicar, responder, editar, borrar y anonimato.
 * Las rutas GET son públicas: el token llega sin middleware de auth, como en producción.
 */
class CommentApiTest extends TestCase
{
    use RefreshDatabase;

    private function bearer(User $user): array
    {
        return ['Authorization' => 'Bearer ' . $user->createToken('t')->plainTextToken];
    }

    public function test_user_can_comment_and_reply_on_a_build(): void
    {
        $user = User::factory()->create();
        $build = UserBuild::factory()->create();

        $comment = $this->withHeaders($this->bearer($user))
            ->postJson('/api/comments', ['type' => 'build', 'id' => $build->id, 'content' => 'Buena build'])
            ->assertCreated()
            ->json();

        $this->withHeaders($this->bearer($user))
            ->postJson('/api/comments', ['type' => 'build', 'id' => $build->id, 'content' => 'Respuesta', 'parent_id' => $comment['id']])
            ->assertCreated();

        $this->getJson("/api/builds/{$build->id}/comments")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.content', 'Buena build')
            ->assertJsonPath('0.replies.0.content', 'Respuesta');
    }

    public function test_guide_comments_work_the_same_way(): void
    {
        $user = User::factory()->create();
        $guide = Guide::factory()->create();

        $this->withHeaders($this->bearer($user))
            ->postJson('/api/comments', ['type' => 'guide', 'id' => $guide->id, 'content' => 'Gracias'])
            ->assertCreated();

        $this->getJson("/api/guides/{$guide->id}/comments")
            ->assertOk()
            ->assertJsonPath('0.content', 'Gracias');
    }

    public function test_html_is_stripped_and_empty_content_is_rejected(): void
    {
        $user = User::factory()->create();
        $build = UserBuild::factory()->create();

        $this->withHeaders($this->bearer($user))
            ->postJson('/api/comments', ['type' => 'build', 'id' => $build->id, 'content' => '<b>hola</b><script>x</script>'])
            ->assertCreated()
            ->assertJsonPath('content', 'holax');

        $this->withHeaders($this->bearer($user))
            ->postJson('/api/comments', ['type' => 'build', 'id' => $build->id, 'content' => '<p> </p>'])
            ->assertStatus(422);
    }

    public function test_reply_must_belong_to_the_same_build(): void
    {
        $user = User::factory()->create();
        $other = Comment::factory()->create();
        $build = UserBuild::factory()->create();

        $this->withHeaders($this->bearer($user))
            ->postJson('/api/comments', ['type' => 'build', 'id' => $build->id, 'content' => 'x', 'parent_id' => $other->id])
            ->assertStatus(422);
    }

    public function test_guests_cannot_comment(): void
    {
        $build = UserBuild::factory()->create();

        $this->postJson('/api/comments', ['type' => 'build', 'id' => $build->id, 'content' => 'x'])
            ->assertUnauthorized();
    }

    public function test_anonymous_comment_hides_its_author_but_tells_the_author_it_is_theirs(): void
    {
        $author = User::factory()->create();
        $comment = Comment::factory()->anonymous()->create(['user_id' => $author->id]);

        // Visitante: ni el usuario ni su id
        $public = $this->getJson("/api/builds/{$comment->build_id}/comments")->assertOk()->json('0');
        $this->assertNull($public['user']);
        $this->assertArrayNotHasKey('user_id', $public);
        $this->assertFalse($public['is_owner']);

        // El autor, con su token en una ruta pública, sí lo ve como propio
        $this->withHeaders($this->bearer($author))
            ->getJson("/api/builds/{$comment->build_id}/comments")
            ->assertJsonPath('0.is_owner', true);
    }

    public function test_owner_can_edit_within_24_hours_only(): void
    {
        $author = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $author->id]);

        $this->withHeaders($this->bearer($author))
            ->putJson("/api/comments/{$comment->id}", ['content' => 'Editado'])
            ->assertOk()
            ->assertJsonPath('content', 'Editado');

        $this->travel(25)->hours();
        $this->app['auth']->forgetGuards();

        $this->withHeaders($this->bearer($author))
            ->putJson("/api/comments/{$comment->id}", ['content' => 'Tarde'])
            ->assertStatus(422);
    }

    public function test_only_owner_or_admin_can_delete(): void
    {
        $comment = Comment::factory()->create();
        $stranger = User::factory()->create();
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        $this->withHeaders($this->bearer($stranger))
            ->deleteJson("/api/comments/{$comment->id}")
            ->assertForbidden();

        $this->app['auth']->forgetGuards();

        $this->withHeaders($this->bearer($admin))
            ->deleteJson("/api/comments/{$comment->id}")
            ->assertOk();

        $this->assertModelMissing($comment);
    }
}
