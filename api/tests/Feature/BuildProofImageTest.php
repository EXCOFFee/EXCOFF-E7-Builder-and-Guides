<?php

namespace Tests\Feature;

use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Captura del juego como prueba de la build: un campo aparte de las imágenes, validado
 * igual que las subidas (contenido, no extensión), que se puede reemplazar o quitar.
 */
class BuildProofImageTest extends TestCase
{
    use RefreshDatabase;

    // PNG real de 1x1 (la imagen de Docker de los tests no tiene la extensión GD)
    private const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    private function png(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode(self::PNG_1X1));
    }

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_build_can_be_created_with_a_proof_screenshot(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/api/builds', [
            'hero_id' => Hero::factory()->create()->id,
            'title' => 'Con prueba',
            'proof_image' => $this->png('stats.png'),
        ], ['Accept' => 'application/json'])->assertCreated();

        $proof = UserBuild::first()->proof_image;
        $this->assertNotNull($proof);
        $this->assertStringContainsString('/storage/builds/proof/', $proof);
        $this->assertCount(1, Storage::disk('public')->files('builds/proof'));
    }

    public function test_disguised_script_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/api/builds', [
            'hero_id' => Hero::factory()->create()->id,
            'title' => 'Trampa',
            'proof_image' => UploadedFile::fake()->createWithContent('stats.png', '<?php echo 1;'),
        ], ['Accept' => 'application/json'])->assertStatus(422);

        $this->assertSame(0, UserBuild::count());
        $this->assertEmpty(Storage::disk('public')->allFiles());
    }

    public function test_owner_can_replace_and_remove_the_proof(): void
    {
        $owner = User::factory()->create();
        $build = UserBuild::factory()->create(['user_id' => $owner->id, 'proof_image' => 'http://localhost/storage/builds/proof/old.png']);

        $this->actingAs($owner)->post("/api/builds/{$build->id}", [
            '_method' => 'PUT',
            'proof_image' => $this->png('new.png'),
        ], ['Accept' => 'application/json'])->assertOk();
        $this->assertStringNotContainsString('old.png', $build->fresh()->proof_image);

        $this->actingAs($owner)->post("/api/builds/{$build->id}", [
            '_method' => 'PUT',
            'remove_proof_image' => '1',
        ], ['Accept' => 'application/json'])->assertOk();
        $this->assertNull($build->fresh()->proof_image);
    }

    public function test_update_without_proof_fields_keeps_it(): void
    {
        $owner = User::factory()->create();
        $build = UserBuild::factory()->create(['user_id' => $owner->id, 'proof_image' => 'http://localhost/storage/builds/proof/keep.png']);

        $this->actingAs($owner)->putJson("/api/builds/{$build->id}", ['title' => 'Otro título'])->assertOk();

        $this->assertSame('http://localhost/storage/builds/proof/keep.png', $build->fresh()->proof_image);
    }
}
