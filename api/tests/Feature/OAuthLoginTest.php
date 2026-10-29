<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

/**
 * OAuth login: the callback redirects with a one-time code (never the token),
 * and the frontend exchanges that code for a token exactly once.
 */
class OAuthLoginTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogleUser(): void
    {
        $socialUser = (new SocialiteUser())->map([
            'id' => 'google-123',
            'name' => 'Santi',
            'email' => 'santi@example.test',
            'avatar' => 'https://example.test/avatar.png',
        ]);
        $socialUser->token = 'provider-token';
        $socialUser->refreshToken = 'provider-refresh';

        $provider = Mockery::mock();
        $provider->shouldReceive('stateless')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($socialUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    /** Runs the OAuth callback and returns the one-time code from the redirect. */
    private function loginCode(): string
    {
        $this->fakeGoogleUser();
        config(['app.frontend_url' => 'https://excoffe7.test']);

        $location = $this->get('/api/auth/google/callback')->assertRedirect()->headers->get('Location');

        $this->assertStringStartsWith('https://excoffe7.test/auth/callback?code=', $location);
        $this->assertStringNotContainsString('token', $location);
        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);

        return $query['code'];
    }

    public function test_callback_redirects_with_a_code_and_no_token(): void
    {
        $code = $this->loginCode();

        $this->assertSame(64, strlen($code));
        $this->assertDatabaseHas('users', ['email' => 'santi@example.test', 'provider' => 'google']);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_code_exchanges_for_a_working_token(): void
    {
        $token = $this->postJson('/api/auth/exchange', ['code' => $this->loginCode()])
            ->assertOk()
            ->assertJsonPath('user.email', 'santi@example.test')
            ->json('token');

        $this->withToken($token)->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'santi@example.test');
    }

    public function test_code_works_only_once(): void
    {
        $code = $this->loginCode();

        $this->postJson('/api/auth/exchange', ['code' => $code])->assertOk();
        $this->postJson('/api/auth/exchange', ['code' => $code])->assertUnprocessable();

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_expired_code_is_rejected(): void
    {
        $code = $this->loginCode();

        $this->travel(61)->seconds();

        $this->postJson('/api/auth/exchange', ['code' => $code])->assertUnprocessable();
    }

    public function test_unknown_or_malformed_code_is_rejected(): void
    {
        $this->postJson('/api/auth/exchange', ['code' => str_repeat('a', 64)])->assertUnprocessable();
        $this->postJson('/api/auth/exchange', ['code' => 'short'])->assertUnprocessable();
        $this->postJson('/api/auth/exchange', [])->assertUnprocessable();

        $this->assertSame(0, User::count());
    }
}
