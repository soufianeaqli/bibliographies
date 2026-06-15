<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Module 1 — Authentification (F01 à F04).
 *
 * Authentification par token Sanctum (sans état) : chaque connexion génère
 * un token porteur (« Bearer ») que le frontend stocke et renvoie à chaque
 * requête protégée.
 */
class AuthController extends Controller
{
    /**
     * Format d'adresse e-mail accepté.
     *
     * On utilise une expression régulière plutôt que la règle de validation
     * « email » intégrée à Laravel, afin d'éviter CVE-2026-48019 (injection
     * CRLF via la règle « email » par défaut, non corrigée en branche 11.x).
     */
    private const REGLE_EMAIL = 'regex:/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/';

    /** Message d'erreur (FR) pour la règle ci-dessus. */
    private const MESSAGES_EMAIL = [
        'email.regex' => "Le champ email doit être une adresse e-mail valide.",
    ];

    /**
     * F01 — Inscription : crée un compte (nom, email, mot de passe) puis
     * renvoie immédiatement un token afin de connecter l'utilisateur.
     */
    public function register(Request $request): JsonResponse
    {
        $donnees = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', self::REGLE_EMAIL, 'max:255', 'unique:utilisateur,email'],
            'mot_de_passe' => ['required', 'string', 'min:8', 'confirmed'],
        ], self::MESSAGES_EMAIL);

        $utilisateur = Utilisateur::create([
            'nom' => $donnees['nom'],
            'email' => $donnees['email'],
            'mot_de_passe' => $donnees['mot_de_passe'], // haché automatiquement (cast « hashed »)
            'role' => 'utilisateur',
            'statut' => 'actif',
        ]);

        $token = $utilisateur->createToken('api')->plainTextToken;

        return response()->json([
            'utilisateur' => $utilisateur,
            'token' => $token,
        ], 201);
    }

    /**
     * F02 — Connexion : vérifie les identifiants et renvoie un token Sanctum.
     */
    public function login(Request $request): JsonResponse
    {
        $donnees = $request->validate([
            'email' => ['required', 'string', self::REGLE_EMAIL],
            'mot_de_passe' => ['required', 'string'],
        ], self::MESSAGES_EMAIL);

        $utilisateur = Utilisateur::where('email', $donnees['email'])->first();

        if (! $utilisateur || ! Hash::check($donnees['mot_de_passe'], $utilisateur->mot_de_passe)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        if (! $utilisateur->estActif()) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte est désactivé. Veuillez contacter un administrateur.'],
            ]);
        }

        $token = $utilisateur->createToken('api')->plainTextToken;

        return response()->json([
            'utilisateur' => $utilisateur,
            'token' => $token,
        ]);
    }

    /**
     * F03 — Déconnexion : révoque uniquement le token utilisé pour la requête.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Renvoie l'utilisateur actuellement authentifié.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * F04 — Modification du profil : met à jour le nom, l'email et/ou le
     * mot de passe de l'utilisateur authentifié. Chaque champ est optionnel.
     */
    public function update(Request $request): JsonResponse
    {
        $utilisateur = $request->user();

        $donnees = $request->validate([
            'nom' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes', 'required', 'string', self::REGLE_EMAIL, 'max:255',
                Rule::unique('utilisateur', 'email')->ignore($utilisateur->id),
            ],
            'mot_de_passe' => ['sometimes', 'required', 'string', 'min:8', 'confirmed'],
        ], self::MESSAGES_EMAIL);

        $utilisateur->fill($donnees);
        $utilisateur->save();

        return response()->json([
            'utilisateur' => $utilisateur,
            'message' => 'Profil mis à jour avec succès.',
        ]);
    }
}
