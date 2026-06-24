<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Notification;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function pendingReservations(): JsonResponse
    {
        $reservations = Reservation::where('status', 'pending')
            ->with(['reference', 'utilisateur'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reservations);
    }

    public function approve($id): JsonResponse
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->update(['status' => 'approved']);

        Notification::create([
            'utilisateur_id' => $reservation->utilisateur_id,
            'type' => 'reservation_approved',
            'message' => 'Votre réservation pour « ' . $reservation->reference->titre . ' » a été approuvée. Vous pouvez maintenant lire le livre.',
            'reference_id' => $reservation->reference_id,
        ]);

        return response()->json(['message' => 'Réservation approuvée.', 'reservation' => $reservation->load('reference')]);
    }

    public function reject($id): JsonResponse
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->update(['status' => 'cancelled']);

        Notification::create([
            'utilisateur_id' => $reservation->utilisateur_id,
            'type' => 'reservation_rejected',
            'message' => 'Votre réservation pour « ' . $reservation->reference->titre . ' » a été refusée.',
            'reference_id' => $reservation->reference_id,
        ]);

        return response()->json(['message' => 'Réservation refusée.', 'reservation' => $reservation->load('reference')]);
    }

    public function users(): JsonResponse
    {
        $users = Utilisateur::withCount([
            'references',
            'favoris',
        ])->orderBy('date_creation', 'desc')->get();

        return response()->json($users);
    }

    public function userDetail(Utilisateur $utilisateur): JsonResponse
    {
        $utilisateur->loadCount([
            'references',
            'favoris',
        ]);

        $stats = [
            'reservations_count' => Reservation::where('utilisateur_id', $utilisateur->id)->count(),
            'notifications_count' => Notification::where('utilisateur_id', $utilisateur->id)->count(),
        ];

        return response()->json(array_merge($utilisateur->toArray(), $stats));
    }

    public function toggleBlock(Utilisateur $utilisateur): JsonResponse
    {
        if ($utilisateur->estAdministrateur()) {
            return response()->json(['message' => 'Impossible de bloquer un administrateur.'], 403);
        }

        $nouveauStatut = $utilisateur->statut === 'actif' ? 'inactif' : 'actif';
        $utilisateur->update(['statut' => $nouveauStatut]);

        return response()->json([
            'message' => $nouveauStatut === 'actif' ? 'Utilisateur débloqué.' : 'Utilisateur bloqué.',
            'utilisateur' => $utilisateur->fresh(),
        ]);
    }

    public function updateRole(Request $request, Utilisateur $utilisateur): JsonResponse
    {
        if ($utilisateur->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas modifier votre propre rôle.'], 403);
        }

        $data = $request->validate([
            'role' => 'required|in:utilisateur,administrateur',
        ]);

        $utilisateur->update(['role' => $data['role']]);

        return response()->json([
            'message' => 'Rôle mis à jour.',
            'utilisateur' => $utilisateur->fresh(),
        ]);
    }

    public function destroyUser(Utilisateur $utilisateur): JsonResponse
    {
        if ($utilisateur->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }

        if ($utilisateur->estAdministrateur()) {
            return response()->json(['message' => 'Impossible de supprimer un administrateur.'], 403);
        }

        $utilisateur->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
