<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    /**
     * Redirige l'utilisateur vers Google OAuth.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Traite le callback de Google OAuth.
     */
    public function handleGoogleCallback(Request $request)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Exception $e) {
            return redirect("$frontendUrl/auth/callback?error=" . urlencode('L\'authentification Google a échoué.'));
        }

        $utilisateur = Utilisateur::where('email', $googleUser->getEmail())->first();

        if ($utilisateur) {
            if (! $utilisateur->estActif()) {
                return redirect("$frontendUrl/auth/callback?error=" . urlencode('Ce compte est désactivé.'));
            }

            $utilisateur->update([
                'provider' => 'google',
                'provider_id' => $googleUser->getId(),
                'provider_token' => $googleUser->token,
                'avatar' => $googleUser->getAvatar(),
            ]);
        } else {
            $utilisateur = Utilisateur::create([
                'nom' => $googleUser->getName() ?? $googleUser->getEmail(),
                'email' => $googleUser->getEmail(),
                'mot_de_passe' => Hash::make(Str::random(32)),
                'role' => 'utilisateur',
                'statut' => 'actif',
                'provider' => 'google',
                'provider_id' => $googleUser->getId(),
                'provider_token' => $googleUser->token,
                'avatar' => $googleUser->getAvatar(),
            ]);
        }

        $token = $utilisateur->createToken('api')->plainTextToken;

        return redirect("$frontendUrl/auth/callback?token=$token");
    }
}
