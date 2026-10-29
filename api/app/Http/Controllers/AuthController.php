<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * One-time login codes live this long; the frontend exchanges them right after the redirect.
     */
    private const LOGIN_CODE_TTL_SECONDS = 60;

    /**
     * Redirect to OAuth provider
     */
    public function redirectToProvider(string $provider)
    {
        if (!in_array($provider, ['google', 'discord'])) {
            return response()->json(['error' => 'Invalid provider'], 400);
        }

        /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
        $driver = Socialite::driver($provider)->stateless();

        // Force Google to show account picker every time
        if ($provider === 'google') {
            $driver = $driver->with(['prompt' => 'select_account']);
        }

        return $driver->redirect();
    }

    /**
     * Handle OAuth callback
     */
    public function handleProviderCallback(string $provider)
    {
        if (!in_array($provider, ['google', 'discord'])) {
            return response()->json(['error' => 'Invalid provider'], 400);
        }

        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver($provider);
            $socialUser = $driver->stateless()->user();
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url') . '/login?error=oauth_failed');
        }

        // Find or create user
        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (!$user) {
            // Check if email already exists
            $existingUser = User::where('email', $socialUser->getEmail())->first();

            if ($existingUser) {
                // Link OAuth to existing account
                $existingUser->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'provider_token' => $socialUser->token,
                    'provider_refresh_token' => $socialUser->refreshToken,
                    'avatar' => $socialUser->getAvatar(),
                ]);
                $user = $existingUser;
            } else {
                // Create new user
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                    'email' => $socialUser->getEmail(),
                    'avatar' => $socialUser->getAvatar(),
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'provider_token' => $socialUser->token,
                    'provider_refresh_token' => $socialUser->refreshToken,
                ]);
            }
        } else {
            // Update tokens
            $user->update([
                'provider_token' => $socialUser->token,
                'provider_refresh_token' => $socialUser->refreshToken,
                'avatar' => $socialUser->getAvatar(),
            ]);
        }

        // The token never travels in the URL (browser history, proxy logs, Referer):
        // redirect with a short-lived one-time code that the frontend exchanges via POST.
        $code = Str::random(64);
        Cache::put($this->loginCodeKey($code), $user->id, now()->addSeconds(self::LOGIN_CODE_TTL_SECONDS));

        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        return redirect("{$frontendUrl}/auth/callback?code={$code}");
    }

    /**
     * Exchange a one-time login code for an API token. Each code works once.
     */
    public function exchangeCode(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|size:64']);

        $userId = Cache::pull($this->loginCodeKey($request->input('code')));
        $user = $userId ? User::find($userId) : null;

        if (!$user) {
            return response()->json(['error' => 'Login code is invalid or expired. Sign in again.'], 422);
        }

        return response()->json([
            'token' => $user->createToken('auth_token')->plainTextToken,
            'user' => $user,
        ]);
    }

    private function loginCodeKey(string $code): string
    {
        // Only the hash is stored, so a cache dump does not expose usable codes
        return 'login_code:' . hash('sha256', $code);
    }

    /**
     * Get current user
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
