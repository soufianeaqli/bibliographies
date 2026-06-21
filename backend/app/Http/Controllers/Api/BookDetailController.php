<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reference;
use App\Models\Reservation;
use App\Models\HistoriqueLecture;
use App\Models\Bookmark;
use App\Models\Avis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookDetailController extends Controller
{
    public function show($id)
    {
        $book = Reference::with(['avis.utilisateur', 'tags'])->findOrFail($id);

        if ($book->cover_image && !str_starts_with($book->cover_image, 'http')) {
            $book->cover_image = url('storage/' . $book->cover_image);
        }
        if ($book->pdf_path && !str_starts_with($book->pdf_path, 'http')) {
            $book->pdf_path = url('storage/' . $book->pdf_path);
        }
        if ($book->epub_path && !str_starts_with($book->epub_path, 'http')) {
            $book->epub_path = url('storage/' . $book->epub_path);
        }
        if ($book->audio_path && !str_starts_with($book->audio_path, 'http')) {
            $book->audio_path = url('storage/' . $book->audio_path);
        }

        $book->is_reserved = Reservation::where('reference_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->where('status', 'pending')
            ->exists();

        $book->can_read = Reservation::where('reference_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->where('status', 'approved')
            ->exists();

        $book->avis_count = $book->avis->count();
        $book->avg_rating = round($book->avis->avg('rating') ?? 0, 1);

        return response()->json($book);
    }

    public function reserve($id)
    {
        $reference = Reference::findOrFail($id);

        $existing = Reservation::where('reference_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Livre déjà réservé.', 'reserved' => true]);
        }

        $reservation = Reservation::create([
            'utilisateur_id' => Auth::id(),
            'reference_id' => $id,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Livre réservé avec succès !', 'reserved' => true], 201);
    }

    public function cancelReservation($id)
    {
        Reservation::where('reference_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Réservation annulée.', 'reserved' => false]);
    }

    public function getReadingProgress($id)
    {
        $progress = HistoriqueLecture::where('reference_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->first();

        if (!$progress) {
            return response()->json([
                'last_page_read' => 0,
                'progress_percentage' => 0,
            ]);
        }

        return response()->json($progress);
    }

    public function updateReadingProgress(Request $request, $id)
    {
        $request->validate([
            'last_page_read' => 'required|integer|min:0',
            'progress_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $progress = HistoriqueLecture::updateOrCreate(
            [
                'utilisateur_id' => Auth::id(),
                'reference_id' => $id,
            ],
            [
                'last_page_read' => $request->last_page_read,
                'progress_percentage' => $request->progress_percentage,
            ]
        );

        return response()->json($progress);
    }

    public function getBookmarks($id)
    {
        $bookmarks = Bookmark::where('reference_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->orderBy('page_number')
            ->get();

        return response()->json($bookmarks);
    }

    public function addBookmark(Request $request, $id)
    {
        $request->validate([
            'page_number' => 'required|integer|min:1',
            'note' => 'nullable|string|max:500',
        ]);

        $bookmark = Bookmark::create([
            'utilisateur_id' => Auth::id(),
            'reference_id' => $id,
            'page_number' => $request->page_number,
            'note' => $request->note,
        ]);

        return response()->json($bookmark, 201);
    }

    public function deleteBookmark($id)
    {
        $bookmark = Bookmark::where('id', $id)
            ->where('utilisateur_id', Auth::id())
            ->firstOrFail();

        $bookmark->delete();

        return response()->json(['message' => 'Marque-page supprimé.']);
    }

    public function getNotes($id)
    {
        $progress = HistoriqueLecture::where('reference_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->first();

        $notes = [];
        if ($progress && $progress->notes) {
            $notes = json_decode($progress->notes, true) ?? [];
        }

        return response()->json($notes);
    }

    public function addNote(Request $request, $id)
    {
        $request->validate([
            'page_number' => 'required|integer|min:1',
            'text' => 'required|string|max:2000',
        ]);

        $progress = HistoriqueLecture::firstOrCreate(
            [
                'utilisateur_id' => Auth::id(),
                'reference_id' => $id,
            ],
            ['last_page_read' => 0, 'progress_percentage' => 0]
        );

        $notes = [];
        if ($progress->notes) {
            $notes = json_decode($progress->notes, true) ?? [];
        }

        $notes[] = [
            'id' => uniqid(),
            'page_number' => $request->page_number,
            'text' => $request->text,
            'created_at' => now()->toISOString(),
        ];

        $progress->update(['notes' => json_encode($notes)]);

        return response()->json(end($notes), 201);
    }

    public function deleteNote(Request $request, $id, $noteId)
    {
        $progress = HistoriqueLecture::where('reference_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->firstOrFail();

        $notes = json_decode($progress->notes, true) ?? [];
        $notes = array_values(array_filter($notes, fn($n) => ($n['id'] ?? null) != $noteId));

        $progress->update(['notes' => json_encode($notes)]);

        return response()->json(['message' => 'Note supprimée.']);
    }

    public function getAvis($id)
    {
        $avis = Avis::where('reference_id', $id)
            ->with('utilisateur')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($avis);
    }

    public function addAvis(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $existing = Avis::where('reference_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->first();

        if ($existing) {
            $existing->update([
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);
            $avis = $existing;
        } else {
            $avis = Avis::create([
                'utilisateur_id' => Auth::id(),
                'reference_id' => $id,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);
        }

        return response()->json($avis->load('utilisateur'), 201);
    }

    public function getMyReservations()
    {
        $reservations = Reservation::where('utilisateur_id', Auth::id())
            ->with('reference')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reservations);
    }
}
