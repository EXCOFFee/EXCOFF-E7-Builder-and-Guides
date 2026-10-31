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

    public function test_replaced_removed_and_deleted_proofs_leave_no_files(): void
    {
        $owner = User::factory()->create();
        $this->actingAs($owner)->post('/api/builds', [
            'hero_id' => Hero::factory()->create()->id,
            'title' => 'Con prueba',
            'proof_image' => $this->png('a.png'),
        ], ['Accept' => 'application/json'])->assertCreated();
        $build = UserBuild::first();

        $this->actingAs($owner)->post("/api/builds/{$build->id}", ['_method' => 'PUT', 'proof_image' => $this->png('b.png')], ['Accept' => 'application/json'])->assertOk();
        $this->assertCount(1, Storage::disk('public')->files('builds/proof'));

        $this->actingAs($owner)->deleteJson("/api/builds/{$build->id}")->assertOk();
        $this->assertCount(0, Storage::disk('public')->files('builds/proof'));
    }

    public function test_rejected_proof_is_reported_on_its_own_field(): void
    {
        // Pasa la regla "image" de Laravel (es un PNG) pero ImageService lo rechaza por medidas
        config(['app.url' => 'http://localhost']);
        $huge = UploadedFile::fake()->createWithContent('big.png', $this->pngOfSize(5000, 10));

        $this->actingAs(User::factory()->create())->post('/api/builds', [
            'hero_id' => Hero::factory()->create()->id,
            'title' => 'Grande',
            'proof_image' => $huge,
        ], ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('proof_image')
            ->assertJsonMissingValidationErrors('images');
    }

    public function test_owner_viewing_their_build_does_not_add_views(): void
    {
        $owner = User::factory()->create();
        $build = UserBuild::factory()->create(['user_id' => $owner->id, 'views' => 0]);

        $this->withHeaders(['Authorization' => 'Bearer ' . $owner->createToken('t')->plainTextToken])
            ->getJson("/api/builds/{$build->id}")->assertOk();
        $this->assertSame(0, $build->fresh()->views);

        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/builds/{$build->id}")->assertOk();
        $this->assertSame(1, $build->fresh()->views);
    }

    /** PNG válido de ancho x alto sin GD: cabecera IHDR con las medidas (el contenido no importa) */
    private function pngOfSize(int $width, int $height): string
    {
        $ihdr = pack('NNCCCCC', $width, $height, 8, 2, 0, 0, 0);
        $chunk = fn (string $type, string $data) => pack('N', strlen($data)) . $type . $data . pack('N', crc32($type . $data));
        $raw = str_repeat("\0" . str_repeat("\0\0\0", $width), $height);

        return "\x89PNG\r\n\x1a\n" . $chunk('IHDR', $ihdr) . $chunk('IDAT', gzcompress($raw)) . $chunk('IEND', '');
    }

    public function test_update_without_proof_fields_keeps_it(): void
    {
        $owner = User::factory()->create();
        $build = UserBuild::factory()->create(['user_id' => $owner->id, 'proof_image' => 'http://localhost/storage/builds/proof/keep.png']);

        $this->actingAs($owner)->putJson("/api/builds/{$build->id}", ['title' => 'Otro título'])->assertOk();

        $this->assertSame('http://localhost/storage/builds/proof/keep.png', $build->fresh()->proof_image);
    }
}
