<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
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
        return response()->json(['message' => 'Réservation approuvée.', 'reservation' => $reservation->load('reference')]);
    }

    public function reject($id): JsonResponse
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Réservation refusée.', 'reservation' => $reservation->load('reference')]);
    }
}
