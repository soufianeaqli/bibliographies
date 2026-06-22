<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Notification;
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
}
