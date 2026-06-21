<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

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
        $queries = ['science+fiction', 'dune', 'fantasy', 'artificial+intelligence', 'bestsellers'];
        $query = $queries[array_rand($queries)];
        $apiKey = env('GOOGLE_BOOKS_API_KEY', '');
        $cacheKey = "google_books_import_{$query}";

        $items = Cache::remember($cacheKey, 86400, function () use ($query, $apiKey) {
            $url = "https://www.googleapis.com/books/v1/volumes?q={$query}&maxResults=15";
            if ($apiKey) {
                $url .= "&key={$apiKey}";
            }

            $response = Http::timeout(10)->get($url);

            if ($response->successful()) {
                return $response->json('items') ?? [];
            }

            return null;
        });

        if ($items === null) {
            $items = $this->getFallbackBooks();
        }

        $mockVideos = [
            'https://www.youtube.com/watch?v=Way9Dexny3w',
            'https://www.youtube.com/watch?v=n9xhKvEQ7Z0',
            'https://www.youtube.com/watch?v=8Qn_spdM5Zg'
        ];

        $imported = 0;

        foreach ($items as $item) {
            $info = $item['volumeInfo'] ?? $item;
            $titre = $info['title'] ?? ($info['titre'] ?? null);
            $auteur = $info['authors'] ?? ($info['auteur'] ?? null);
            if (is_array($auteur)) {
                $auteur = implode(', ', $auteur);
            }
            if (!$titre || !$auteur) {
                continue;
            }

            $reference = new Reference();
            $reference->titre = $titre;
            $reference->auteur = $auteur;
            $reference->description = substr($info['description'] ?? 'Aucune description fournie.', 0, 800);
            $reference->type = 'livre';
            $reference->utilisateur_id = Auth::id() ?? 1;

            if (!empty($info['imageLinks']['thumbnail'] ?? null)) {
                $imgUrl = str_replace('http:', 'https:', $info['imageLinks']['thumbnail']);
                $imgUrl = str_replace('&edge=curl', '', $imgUrl);
                $reference->cover_image = $imgUrl;
            } elseif (!empty($info['cover_image'] ?? null)) {
                $reference->cover_image = $info['cover_image'];
            }

            $reference->video_url = $mockVideos[array_rand($mockVideos)];
            $reference->rating = $info['averageRating'] ?? $info['rating'] ?? 4.5;
            $reference->total_pages = $info['pageCount'] ?? $info['total_pages'] ?? 300;
            $reference->is_featured = (rand(1, 10) > 7);

            $reference->save();
            $imported++;
        }

        return response()->json([
            'message' => "{$imported} sublimes livres importés de l'univers avec succès !"
        ]);
    }

    private function getFallbackBooks(): array
    {
        return [
            [
                'volumeInfo' => [
                    'title' => 'Dune',
                    'authors' => ['Frank Herbert'],
                    'description' => 'Dans un futur lointain, Paul Atreides, jeune noble destiné à régner sur la planète désertique Arrakis, se retrouve au coeur d\'un conflit galactique pour le contrôle de l\'Épice, la substance la plus précieuse de l\'univers.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11153264-M.jpg'],
                    'averageRating' => 4.7,
                    'pageCount' => 688,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Neuromancien',
                    'authors' => ['William Gibson'],
                    'description' => 'Case, ancien cowboy du cyberspace, est engagé pour un dernier casse qui le plonge au coeur d\'une Intelligence Artificielle en pleine évolution. Roman fondateur du mouvement cyberpunk.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11082227-M.jpg'],
                    'averageRating' => 4.3,
                    'pageCount' => 320,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Fondation',
                    'authors' => ['Isaac Asimov'],
                    'description' => 'Le psychohistorien Hari Seldon prédit la chute de l\'Empire Galactique. Pour sauver le savoir de l\'humanité, il crée la Fondation, un groupe destiné à reconstruire la civilisation en quelques millénaires.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11058681-M.jpg'],
                    'averageRating' => 4.5,
                    'pageCount' => 244,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Le Cycle de l\'Épée',
                    'authors' => ['Michael Moorcock'],
                    'description' => 'Elric de Melniboné, dernier empereur albinos d\'un royaume décadent, manie l\'Épée Noire Stormbringer qui dévore les âmes de ses ennemis. Une quête épique à travers les multivers.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11085221-M.jpg'],
                    'averageRating' => 4.2,
                    'pageCount' => 480,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => '1984',
                    'authors' => ['George Orwell'],
                    'description' => 'Dans un monde totalitaire où Big Brother vous regarde, Winston Smith tente de préserver son humanité et sa liberté de pensée face à un régime qui contrôle jusqu\'à la vérité elle-même.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11083989-M.jpg'],
                    'averageRating' => 4.6,
                    'pageCount' => 328,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Le Meilleur des Mondes',
                    'authors' => ['Aldous Huxley'],
                    'description' => 'Dans une société où les humains sont conditionnés dès la naissance pour leur future fonction, un « Sauvage » élevé en dehors de ce système confronte les valeurs de ce monde parfait.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11064535-M.jpg'],
                    'averageRating' => 4.4,
                    'pageCount' => 311,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Ubik',
                    'authors' => ['Philip K. Dick'],
                    'description' => 'Dans un monde où les morts peuvent être maintenus dans un état de semi-conscience, un groupe de personnes piégées dans une réalité qui se dégrade doit découvrir la vérité avant qu\'il ne soit trop tard.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11075312-M.jpg'],
                    'averageRating' => 4.1,
                    'pageCount' => 240,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Les Robots',
                    'authors' => ['Isaac Asimov'],
                    'description' => 'Recueil de nouvelles qui posent les bases des Trois Lois de la Robotique, explorant les relations complexes entre humains et robots dans un futur où ils coexistent.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11064123-M.jpg'],
                    'averageRating' => 4.3,
                    'pageCount' => 360,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Harry Potter à l\'École des Sorciers',
                    'authors' => ['J.K. Rowling'],
                    'description' => 'Le jour de ses onze ans, Harry Potter découvre qu\'il est un sorcier et intègre Poudlard, une école de magie où l\'attend un destin hors du commun.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11085427-M.jpg'],
                    'averageRating' => 4.8,
                    'pageCount' => 332,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'La Guerre des Mondes',
                    'authors' => ['H.G. Wells'],
                    'description' => 'L\'Angleterre est envahie par des Martiens dotés d\'une technologie bien supérieure. Un récit de survie haletant qui a inspiré des générations de science-fiction.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11072215-M.jpg'],
                    'averageRating' => 4.0,
                    'pageCount' => 192,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Le Seigneur des Anneaux : La Communauté de l\'Anneau',
                    'authors' => ['J.R.R. Tolkien'],
                    'description' => 'Frodon Sacquet hérite d\'un anneau aux pouvoirs maléfiques et entreprend un voyage périlleux pour le détruire dans les flammes de la Montagne du Destin, accompagné de la Communauté de l\'Anneau.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg'],
                    'averageRating' => 4.7,
                    'pageCount' => 576,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Blade Runner (Les Androïdes rêvent-ils de moutons électriques ?)',
                    'authors' => ['Philip K. Dick'],
                    'description' => 'Rick Deckard est un chasseur de primes chargé d\'éliminer des androïdes évadés qui se font passer pour des humains. Mais la frontière entre humain et machine devient de plus en plus floue.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11082644-M.jpg'],
                    'averageRating' => 4.3,
                    'pageCount' => 240,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Chroniques martiennes',
                    'authors' => ['Ray Bradbury'],
                    'description' => 'Une série de nouvelles qui racontent la colonisation de Mars par les humains, la rencontre avec les mystérieux Martiens, et la lente transformation de la planète rouge.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11072518-M.jpg'],
                    'averageRating' => 4.2,
                    'pageCount' => 224,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Le Problème à trois corps',
                    'authors' => ['Liu Cixin'],
                    'description' => 'Durant la Révolution Culturelle chinoise, un projet secret de communication avec les extraterrestres déclenche une série d\'événements qui menacent l\'avenir de l\'humanité tout entière.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11083263-M.jpg'],
                    'averageRating' => 4.4,
                    'pageCount' => 416,
                ]
            ],
            [
                'volumeInfo' => [
                    'title' => 'Le Nom du Vent',
                    'authors' => ['Patrick Rothfuss'],
                    'description' => 'Kvothe raconte sa vie extraordinaire, de ses années d\'enfance vagabonde à son entrée dans une prestigieuse école de magie, poursuivi par une mystérieuse malédiction.',
                    'imageLinks' => ['thumbnail' => 'https://covers.openlibrary.org/b/id/11085782-M.jpg'],
                    'averageRating' => 4.6,
                    'pageCount' => 736,
                ]
            ],
        ];
    }
}
