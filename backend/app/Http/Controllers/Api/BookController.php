<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class BookController extends Controller
{
    public function index()
    {
        // Return books (references of type 'livre') with latest first
        $books = Reference::where('type', 'livre')->orderBy('id', 'desc')->get();

        // Appends the server URL so the frontend can load images/media natively, unless it's already an absolute URL (like Google API)
        $books->transform(function ($book) {
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
            return $book;
        });

        return response()->json($books);
    }

    public function store(Request $request)
    {
        // Validation basique
        $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'cover_image' => 'nullable|file|mimes:jpeg,png,jpg,webp|max:5120',
            'pdf_file' => 'nullable|file|mimes:pdf|max:51200',
            'audio_file' => 'nullable|file|mimes:mp3,wav|max:102400',
        ]);

        $reference = new Reference();
        $reference->titre = $request->input('title');
        $reference->auteur = $request->input('author');
        $reference->type = 'livre';
        // Assigner à l'utilisateur actuel
        $reference->utilisateur_id = Auth::id() ?? 1;

        // Upload des fichiers
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('books/covers', 'public');
            $reference->cover_image = $path;
        }

        if ($request->hasFile('pdf_file')) {
            $path = $request->file('pdf_file')->store('books/pdfs', 'public');
            $reference->pdf_path = $path;
        }

        if ($request->hasFile('audio_file')) {
            $path = $request->file('audio_file')->store('books/audio', 'public');
            $reference->audio_path = $path;
        }

        $reference->description = $request->input('description');
        $reference->video_url = $request->input('video_url');

        $reference->save();

        return response()->json($reference, 201);
    }

    public function destroy($id)
    {
        $reference = Reference::findOrFail($id);

        // Suppression des fichiers physiques
        if ($reference->cover_image)
            Storage::disk('public')->delete($reference->cover_image);
        if ($reference->pdf_path)
            Storage::disk('public')->delete($reference->pdf_path);
        if ($reference->audio_path)
            Storage::disk('public')->delete($reference->audio_path);

        $reference->delete();

        return response()->json(['message' => 'Livre supprimé']);
    }

    public function importFromGoogle(Request $request)
    {
        // Rechercher des livres parmi ces thèmes
        $queries = ['science+fiction', 'dune', 'fantasy', 'artificial+intelligence', 'bestsellers'];
        $query = $queries[array_rand($queries)];

        $response = Http::get("https://www.googleapis.com/books/v1/volumes?q={$query}&maxResults=15");

        if (!$response->successful()) {
            return response()->json(['error' => 'API Google inaccessible'], 500);
        }

        $items = $response->json('items') ?? [];
        $imported = 0;

        foreach ($items as $item) {
            $info = $item['volumeInfo'] ?? [];
            if (!isset($info['title']) || !isset($info['authors']))
                continue;

            // URL de vidéos aléatoires (pour donner un effet premium "trailer")
            $mockVideos = [
                'https://www.youtube.com/watch?v=Way9Dexny3w',
                'https://www.youtube.com/watch?v=n9xhKvEQ7Z0',
                'https://www.youtube.com/watch?v=8Qn_spdM5Zg'
            ];

            $reference = new Reference();
            $reference->titre = $info['title'];
            $reference->auteur = implode(', ', $info['authors']);
            $reference->description = substr($info['description'] ?? 'Aucune description fournie par Google Books.', 0, 800);
            $reference->type = 'livre';
            $reference->utilisateur_id = Auth::id() ?? 1;

            // Thumbnail image: upgrade zoom to 0 if possible to get better res, but default thumbnail is ok.
            if (isset($info['imageLinks']['thumbnail'])) {
                $imgUrl = str_replace('http:', 'https:', $info['imageLinks']['thumbnail']);
                $imgUrl = str_replace('&edge=curl', '', $imgUrl); // remove page curl
                $reference->cover_image = $imgUrl;
            }

            $reference->video_url = $mockVideos[array_rand($mockVideos)];
            $reference->rating = $info['averageRating'] ?? 4.5;
            $reference->total_pages = $info['pageCount'] ?? 300;
            $reference->is_featured = (rand(1, 10) > 7); // Randomly feature some API books

            $reference->save();
            $imported++;
        }

        return response()->json(['message' => "$imported sublimes livres importés de l'univers avec succès !"]);
    }
}
