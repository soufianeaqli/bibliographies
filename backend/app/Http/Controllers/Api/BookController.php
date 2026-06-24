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

    public function destroyAll()
    {
        $count = Reference::where('type', 'livre')->count();

        // Supprime les fichiers physiques de tous les livres
        $books = Reference::where('type', 'livre')->get();
        foreach ($books as $book) {
            if ($book->cover_image)
                Storage::disk('public')->delete($book->cover_image);
            if ($book->pdf_path)
                Storage::disk('public')->delete($book->pdf_path);
            if ($book->audio_path)
                Storage::disk('public')->delete($book->audio_path);
            $book->delete();
        }

        return response()->json(['message' => "{$count} livres supprimés"]);
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

    public function searchExternalApi(Request $request)
    {
        $request->validate(['query' => 'required|string|min:2']);
        $query = urlencode($request->input('query'));
        $apiKey = env('GOOGLE_BOOKS_API_KEY', '');

        $url = "https://www.googleapis.com/books/v1/volumes?q={$query}&maxResults=10&langRestrict=fr";
        if ($apiKey) {
            $url .= "&key={$apiKey}";
        }

        $items = [];
        try {
            $response = Http::timeout(10)->get($url);
            if ($response->successful()) {
                $items = $response->json('items') ?? [];
            }
        } catch (\Exception $e) {}

        $results = [];
        foreach ($items as $item) {
            $info = $item['volumeInfo'] ?? [];
            $results[] = [
                'google_id' => $item['id'] ?? null,
                'titre' => $info['title'] ?? null,
                'auteur' => isset($info['authors']) ? (is_array($info['authors']) ? implode(', ', $info['authors']) : $info['authors']) : null,
                'description' => substr($info['description'] ?? '', 0, 800),
                'cover_image' => !empty($info['imageLinks']['thumbnail']) ? str_replace(['http:', '&edge=curl'], ['https:', ''], $info['imageLinks']['thumbnail']) : null,
                'annee' => !empty($info['publishedDate']) ? (int) substr($info['publishedDate'], 0, 4) : null,
                'rating' => $info['averageRating'] ?? null,
                'total_pages' => $info['pageCount'] ?? null,
            ];
        }

        return response()->json($results);
    }

    public function importSelected(Request $request)
    {
        $request->validate([
            'titre' => 'required|string',
            'auteur' => 'required|string',
        ]);

        $existing = Reference::where('titre', $request->input('titre'))
            ->where('auteur', $request->input('auteur'))
            ->first();
        if ($existing) {
            return response()->json(['message' => 'Ce livre existe déjà dans la bibliothèque.'], 409);
        }

        $reference = Reference::create([
            'titre' => $request->input('titre'),
            'auteur' => $request->input('auteur'),
            'description' => $request->input('description'),
            'type' => 'livre',
            'utilisateur_id' => Auth::id() ?? 1,
            'cover_image' => $request->input('cover_image'),
            'annee' => $request->input('annee'),
            'rating' => $request->input('rating', 4.0),
            'total_pages' => $request->input('total_pages', 300),
            'is_featured' => false,
            'genre' => $request->input('genre'),
            'date_creation' => now(),
        ]);

        $reference->cover_image = $reference->cover_image
            ? (str_starts_with($reference->cover_image, 'http') ? $reference->cover_image : url('storage/' . $reference->cover_image))
            : null;

        return response()->json($reference, 201);
    }

    public function fetchFromUrl(Request $request)
    {
        $request->validate(['url' => 'required|string']);
        $url = trim($request->input('url'));

        // Extract Google Books volume ID from various URL formats
        $volumeId = null;
        // Format: https://books.google.com/books?id=XYZ
        if (preg_match('/books\.google\.com\/books\?id=([a-zA-Z0-9_\-]+)/', $url, $m)) {
            $volumeId = $m[1];
        }
        // Format: https://www.googleapis.com/books/v1/volumes/XYZ
        elseif (preg_match('/googleapis\.com\/books\/v1\/volumes\/([a-zA-Z0-9_\-]+)/', $url, $m)) {
            $volumeId = $m[1];
        }
        // Format: https://www.google.com/books/edition/Title/XYZ
        elseif (preg_match('/google\.com\/books\/edition\/[^\/]+\/([a-zA-Z0-9_\-]+)/', $url, $m)) {
            $volumeId = $m[1];
        }
        // Format: raw ID
        elseif (preg_match('/^[a-zA-Z0-9_\-]{6,}$/', $url)) {
            $volumeId = $url;
        }

        if (!$volumeId) {
            return response()->json(['message' => 'URL Google Books invalide. Utilisez un lien comme https://books.google.com/books?id=...'], 422);
        }

        $apiKey = env('GOOGLE_BOOKS_API_KEY', '');
        $apiUrl = "https://www.googleapis.com/books/v1/volumes/{$volumeId}";
        if ($apiKey) {
            $apiUrl .= "?key={$apiKey}";
        }

        $item = $this->fetchGoogleBookVolume($volumeId, $apiKey);

        if (!$item) {
            // Fallback : chercher via l'API search avec l'ID
            $searchUrl = "https://www.googleapis.com/books/v1/volumes?q=id:{$volumeId}";
            if ($apiKey) {
                $searchUrl .= "&key={$apiKey}";
            }
            try {
                $searchResp = Http::timeout(10)->get($searchUrl);
                if ($searchResp->successful()) {
                    $items = $searchResp->json('items') ?? [];
                    $item = $items[0] ?? null;
                }
            } catch (\Exception $e) {}
        }

        if (!$item) {
            // Fallback local : lookup table des IDs Google Books connus
            $localBook = $this->getLocalFallback($volumeId);
            if ($localBook) {
                return response()->json($localBook);
            }

            // Fallback OpenLibrary
            $olItem = $this->fetchFromOpenLibrary($volumeId);
            if ($olItem) {
                return response()->json($olItem);
            }

            return response()->json(['message' => 'Livre introuvable. L\'API Google Books a limité les requêtes (429). Ajoutez une clé GOOGLE_BOOKS_API_KEY dans .env ou réessayez plus tard.'], 429);
        }

        $info = $item['volumeInfo'] ?? [];
        $categories = $info['categories'] ?? [];
        $genre = is_array($categories) ? ($categories[0] ?? null) : $categories;
        $book = [
            'google_id' => $item['id'] ?? $volumeId,
            'titre' => $info['title'] ?? null,
            'auteur' => isset($info['authors']) ? (is_array($info['authors']) ? implode(', ', $info['authors']) : $info['authors']) : null,
            'description' => substr($info['description'] ?? '', 0, 800),
            'cover_image' => !empty($info['imageLinks']['thumbnail'])
                ? str_replace(['http:', '&edge=curl', 'zoom=1'], ['https:', '', 'zoom=3'], $info['imageLinks']['thumbnail'])
                : null,
            'annee' => !empty($info['publishedDate']) ? (int) substr($info['publishedDate'], 0, 4) : null,
            'rating' => $info['averageRating'] ?? null,
            'total_pages' => $info['pageCount'] ?? null,
            'preview_link' => $item['accessInfo']['previewLink'] ?? $info['previewLink'] ?? null,
            'genre' => $genre,
        ];

        return response()->json($book);
    }

    public function importBooks100()
    {
        $googleKey = env('GOOGLE_BOOKS_API_KEY', '');
        $youtubeKey = env('YOUTUBE_API_KEY', '');

        $categories = [
            'science+fiction', 'fantasy', 'histoire', 'philosophie',
            'technologie', 'biographie', 'roman', 'thriller', 'art',
            'self+help',
        ];

        $imported = 0;
        $skippedNoCover = 0;
        $skippedFewPages = 0;
        $skippedNoDesc = 0;
        $totalProcessed = 0;

        foreach ($categories as $cat) {
            // Essayer API Google Books si clé présente
            $items = [];
            if ($googleKey) {
                $cacheKey = 'google_books_pro_' . md5($cat);
                $items = Cache::remember($cacheKey, 86400, function () use ($cat, $googleKey) {
                    $url = "https://www.googleapis.com/books/v1/volumes?q={$cat}&maxResults=10&startIndex=0&key={$googleKey}";
                    try {
                        $response = Http::timeout(15)->get($url);
                        if ($response->successful()) {
                            return $response->json('items') ?? [];
                        }
                    } catch (\Exception $e) {}
                    return [];
                });
            }

            // Fallback : si API pas dispo ou pas de clé, utiliser des livres prédéfinis
            if (empty($items)) {
                $items = $this->getImportFallback($cat);
            }

            foreach ($items as $item) {
                $totalProcessed++;
                $info = $item['volumeInfo'] ?? $item;
                $titre = $info['title'] ?? null;
                $auteur = isset($info['authors']) ? (is_array($info['authors']) ? implode(', ', $info['authors']) : $info['authors']) : null;

                if (!$titre || !$auteur) {
                    continue;
                }

                // Filtres stricts (s'appliquent aussi au fallback)
                $hasCover = !empty($info['imageLinks']['thumbnail'] ?? null);
                $pageCount = $info['pageCount'] ?? 0;
                $hasDescription = !empty($info['description'] ?? null);

                if (!$hasCover) { $skippedNoCover++; continue; }
                if ((int) $pageCount < 20) { $skippedFewPages++; continue; }
                if (!$hasDescription) { $skippedNoDesc++; continue; }

                // Éviter doublons
                $existing = Reference::where('titre', $titre)->where('auteur', $auteur)->first();
                if ($existing) {
                    continue;
                }

                // Cover haute qualité
                $cover = str_replace('http:', 'https:', $info['imageLinks']['thumbnail']);
                $cover = str_replace('&edge=curl', '', $cover);
                $cover = str_replace('zoom=1', 'zoom=3', $cover);

                $description = substr($info['description'], 0, 800);
                $annee = !empty($info['publishedDate']) ? (int) substr($info['publishedDate'], 0, 4) : null;
                $rating = $info['averageRating'] ?? null;
                $previewLink = $item['accessInfo']['previewLink'] ?? $info['previewLink'] ?? null;

                // Trailer YouTube (seulement si clé dispo)
                $videoUrl = null;
                if ($youtubeKey) {
                    $ytCacheKey = 'yt_trailer_v2_' . md5($titre);
                    $videoUrl = Cache::remember($ytCacheKey, 86400, function () use ($titre, $auteur, $youtubeKey) {
                        $query = urlencode("\"{$titre}\" {$auteur} book trailer");
                        $ytUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&q={$query}&key={$youtubeKey}&maxResults=1&type=video";
                        try {
                            $ytResp = Http::timeout(10)->get($ytUrl);
                            if ($ytResp->successful()) {
                                $ytItems = $ytResp->json('items') ?? [];
                                if (!empty($ytItems[0]['id']['videoId'])) {
                                    return 'https://www.youtube.com/watch?v=' . $ytItems[0]['id']['videoId'];
                                }
                            }
                        } catch (\Exception $e) {}
                        return null;
                    });
                }

                Reference::create([
                    'titre' => $titre,
                    'auteur' => $auteur,
                    'description' => $description,
                    'type' => 'livre',
                    'utilisateur_id' => Auth::id() ?? 1,
                    'cover_image' => $cover,
                    'video_url' => $videoUrl,
                    'annee' => $annee,
                    'rating' => $rating ?? 4.0,
                    'total_pages' => $pageCount,
                    'is_featured' => rand(1, 100) <= 30,
                    'epub_path' => $previewLink,
                    'date_creation' => now(),
                ]);

                $imported++;
            }

            if ($googleKey) {
                usleep(200000);
            }
        }

        return response()->json([
            'imported' => $imported,
            'skipped_no_cover' => $skippedNoCover,
            'skipped_few_pages' => $skippedFewPages,
            'skipped_no_description' => $skippedNoDesc,
            'total_processed' => $totalProcessed,
        ]);
    }

    private function getImportFallback(string $cat): array
    {
        $all = [
            'science+fiction' => [
                ['titre' => 'Dune', 'auteur' => 'Frank Herbert', 'desc' => 'Paul Atreides, jeune noble destiné à régner sur la planète désertique Arrakis, se retrouve au coeur d\'un conflit galactique pour le contrôle de l\'Épice, la substance la plus précieuse de l\'univers.', 'cover' => 'https://covers.openlibrary.org/b/id/11153264-M.jpg', 'pages' => 688, 'annee' => 1965, 'note' => 4.7],
                ['titre' => 'Neuromancien', 'auteur' => 'William Gibson', 'desc' => 'Case, un hacker déchu, se voit offrir une dernière chance dans les méandres du cyberespace. Roman fondateur du mouvement cyberpunk.', 'cover' => 'https://covers.openlibrary.org/b/id/11082227-M.jpg', 'pages' => 320, 'annee' => 1984, 'note' => 4.3],
                ['titre' => 'Fondation', 'auteur' => 'Isaac Asimov', 'desc' => 'Le psychohistorien Hari Seldon prédit la chute de l\'Empire Galactique. Pour sauver le savoir de l\'humanité, il crée la Fondation.', 'cover' => 'https://covers.openlibrary.org/b/id/11058681-M.jpg', 'pages' => 256, 'annee' => 1951, 'note' => 4.5],
                ['titre' => '1984', 'auteur' => 'George Orwell', 'desc' => 'Dans un monde totalitaire où Big Brother vous regarde, Winston Smith tente de préserver son humanité et sa liberté de pensée.', 'cover' => 'https://covers.openlibrary.org/b/id/11083989-M.jpg', 'pages' => 328, 'annee' => 1949, 'note' => 4.6],
                ['titre' => 'Le Meilleur des Mondes', 'auteur' => 'Aldous Huxley', 'desc' => 'Dans une société où les humains sont conditionnés dès la naissance, un Sauvage élevé en dehors de ce système confronte les valeurs de ce monde parfait.', 'cover' => 'https://covers.openlibrary.org/b/id/11064535-M.jpg', 'pages' => 311, 'annee' => 1932, 'note' => 4.4],
                ['titre' => 'Ubik', 'auteur' => 'Philip K. Dick', 'desc' => 'Dans un monde où les morts peuvent être maintenus en semi-conscience, un groupe piégé dans une réalité qui se dégrade doit découvrir la vérité.', 'cover' => 'https://covers.openlibrary.org/b/id/11075312-M.jpg', 'pages' => 240, 'annee' => 1969, 'note' => 4.1],
                ['titre' => 'La Guerre des Mondes', 'auteur' => 'H.G. Wells', 'desc' => 'L\'Angleterre victorienne envahie par des Martiens aux machines de guerre terrifiantes. Un récit de survie qui a inspiré des générations.', 'cover' => 'https://covers.openlibrary.org/b/id/11072215-M.jpg', 'pages' => 240, 'annee' => 1898, 'note' => 4.0],
                ['titre' => 'Solaris', 'auteur' => 'Stanisław Lem', 'desc' => 'Sur une station orbitale au-dessus de l\'océan pensant Solaris, les souvenirs des visiteurs prennent vie de façon troublante.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 288, 'annee' => 1961, 'note' => 4.3],
                ['titre' => 'Le Problème à trois corps', 'auteur' => 'Liu Cixin', 'desc' => 'Durant la Révolution Culturelle chinoise, un projet secret de communication avec les extraterrestres déclenche des événements menaçant l\'humanité.', 'cover' => 'https://covers.openlibrary.org/b/id/11083263-M.jpg', 'pages' => 416, 'annee' => 2008, 'note' => 4.4],
                ['titre' => 'Chroniques martiennes', 'auteur' => 'Ray Bradbury', 'desc' => 'Une série de nouvelles sur la colonisation de Mars par les humains et la rencontre avec les mystérieux Martiens.', 'cover' => 'https://covers.openlibrary.org/b/id/11072518-M.jpg', 'pages' => 224, 'annee' => 1950, 'note' => 4.2],
            ],
            'fantasy' => [
                ['titre' => 'Le Seigneur des Anneaux', 'auteur' => 'J.R.R. Tolkien', 'desc' => 'Frodon Sacquet hérite d\'un anneau aux pouvoirs maléfiques et entreprend un voyage périlleux pour le détruire dans les flammes de la Montagne du Destin.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 1216, 'annee' => 1954, 'note' => 4.8],
                ['titre' => 'Harry Potter à l\'École des Sorciers', 'auteur' => 'J.K. Rowling', 'desc' => 'Le jour de ses onze ans, Harry Potter découvre qu\'il est un sorcier et intègre Poudlard, une école de magie où l\'attend un destin hors du commun.', 'cover' => 'https://covers.openlibrary.org/b/id/11085427-M.jpg', 'pages' => 332, 'annee' => 1997, 'note' => 4.8],
                ['titre' => 'Le Nom du Vent', 'auteur' => 'Patrick Rothfuss', 'desc' => 'Kvothe raconte sa vie extraordinaire, de ses années d\'enfance vagabonde à son entrée dans une prestigieuse école de magie.', 'cover' => 'https://covers.openlibrary.org/b/id/11085782-M.jpg', 'pages' => 736, 'annee' => 2007, 'note' => 4.6],
                ['titre' => 'Le Trône de Fer', 'auteur' => 'George R.R. Martin', 'desc' => 'Dans le royaume des Sept Couronnes, les grandes familles se disputent le pouvoir tandis qu\'un ancien ennemi se réveille au nord.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 864, 'annee' => 1996, 'note' => 4.6],
                ['titre' => 'Bilbo le Hobbit', 'auteur' => 'J.R.R. Tolkien', 'desc' => 'Bilbo Sacquet, paisible hobbit, est entraîné par treize nains dans une quête pour reprendre un trésor volé par le dragon Smaug.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 320, 'annee' => 1937, 'note' => 4.5],
                ['titre' => 'L\'Assassin Royal', 'auteur' => 'Robin Hobb', 'desc' => 'Fitz, bâtard princier, est formé comme assassin au service de la couronne. Il devra naviguer entre intrigues politiques et magie ancienne.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 544, 'annee' => 1995, 'note' => 4.5],
                ['titre' => 'American Gods', 'auteur' => 'Neil Gaiman', 'desc' => 'Anciens dieux et nouvelles divinités modernes s\'affrontent dans l\'Amérique contemporaine. Un road-movie fantastique unique.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 576, 'annee' => 2001, 'note' => 4.2],
                ['titre' => 'Eragon', 'auteur' => 'Christopher Paolini', 'desc' => 'Un jeune fermier découvre une pierre mystérieuse qui se révèle être un oeuf de dragon. Il devient le dernier des Dragonniers.', 'cover' => 'https://covers.openlibrary.org/b/id/11085427-M.jpg', 'pages' => 544, 'annee' => 2003, 'note' => 4.0],
                ['titre' => 'Les Chroniques de Narnia', 'auteur' => 'C.S. Lewis', 'desc' => 'Quatre enfants découvrent un monde magique à travers une garde-robe enchantée et deviennent les souverains de Narnia.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 256, 'annee' => 1950, 'note' => 4.3],
                ['titre' => 'La Passe-Miroir', 'auteur' => 'Christelle Dabos', 'desc' => 'Ophélie, une jeune femme discrète capable de traverser les miroirs, devient la fiancée d\'un mystérieux seigneur du Pôle.', 'cover' => 'https://covers.openlibrary.org/b/id/11085782-M.jpg', 'pages' => 544, 'annee' => 2013, 'note' => 4.4],
            ],
        ];

        $generic = [
            ['titre' => 'Sapiens', 'auteur' => 'Yuval Noah Harari', 'desc' => 'Une brève histoire de l\'humanité, de la révolution cognitive à nos jours. Un best-seller mondial qui a changé notre regard sur l\'histoire.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 480, 'annee' => 2011, 'note' => 4.6],
            ['titre' => 'Le Petit Prince', 'auteur' => 'Antoine de Saint-Exupéry', 'desc' => 'Un pilote échoué dans le désert rencontre un mystérieux petit prince venu d\'une autre planète qui lui raconte son voyage.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 96, 'annee' => 1943, 'note' => 4.8],
            ['titre' => 'L\'Étranger', 'auteur' => 'Albert Camus', 'desc' => 'Meursault, un employé de bureau indifférent, commet un crime absurde sur une plage algérienne et confronte l\'absurdité du monde.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 160, 'annee' => 1942, 'note' => 4.3],
            ['titre' => 'La Peste', 'auteur' => 'Albert Camus', 'desc' => 'La ville d\'Oran frappée par une épidémie de peste bouscule les certitudes et révèle le meilleur comme le pire de ses habitants.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 320, 'annee' => 1947, 'note' => 4.4],
            ['titre' => 'Vingt mille lieues sous les mers', 'auteur' => 'Jules Verne', 'desc' => 'Le professeur Aronnax explore les abysses à bord du Nautilus du capitaine Nemo, vivant des aventures extraordinaires sous-marines.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 384, 'annee' => 1870, 'note' => 4.2],
            ['titre' => 'Le Comte de Monte-Cristo', 'auteur' => 'Alexandre Dumas', 'desc' => 'Edmond Dantès, injustement emprisonné au château d\'If, s\'évade et met en place une vengeance implacable contre ses ennemis.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 1312, 'annee' => 1844, 'note' => 4.7],
            ['titre' => 'L\'Art de la Guerre', 'auteur' => 'Sun Tzu', 'desc' => 'Traité de stratégie militaire antique dont les principes de guerre et de management restent d\'une étonnante pertinence aujourd\'hui.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 100, 'annee' => -500, 'note' => 4.4],
            ['titre' => 'Pensées pour moi-même', 'auteur' => 'Marc Aurèle', 'desc' => 'Méditations intimes de l\'empereur romain stoïcien sur la vie, la mort, le devoir et la sagesse face à l\'adversité.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 200, 'annee' => 180, 'note' => 4.5],
            ['titre' => 'Le Paradoxe du Choix', 'auteur' => 'Barry Schwartz', 'desc' => 'Pourquoi plus de choix rend moins heureux et comment y remédier. Une analyse fascinante de la psychologie de la décision.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 288, 'annee' => 2004, 'note' => 4.0],
            ['titre' => 'Les Fleurs du Mal', 'auteur' => 'Charles Baudelaire', 'desc' => 'Recueil de poèmes qui explore les thèmes de la beauté, de la mort, de l\'amour et du mal à travers une écriture d\'une modernité radicale.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 256, 'annee' => 1857, 'note' => 4.5],
        ];

        $selected = $all[$cat] ?? $generic;
        $result = [];
        foreach ($selected as $b) {
            $result[] = [
                'volumeInfo' => [
                    'title' => $b['titre'],
                    'authors' => [$b['auteur']],
                    'description' => $b['desc'],
                    'imageLinks' => ['thumbnail' => $b['cover']],
                    'pageCount' => $b['pages'],
                    'publishedDate' => (string) $b['annee'],
                    'averageRating' => $b['note'],
                    'previewLink' => 'https://books.google.com/books?id=placeholder',
                ],
                'accessInfo' => [
                    'previewLink' => 'https://books.google.com/books?id=placeholder',
                ],
            ];
        }
        return $result;
    }

    private function getLocalFallback(string $volumeId): ?array
    {
        $localBooks = [
            '7vj9DAAAQBAJ' => ['titre' => 'Le Petit Prince', 'auteur' => 'Antoine de Saint-Exupéry', 'desc' => 'Un pilote échoué dans le désert rencontre un mystérieux petit prince venu d\'une autre planète. Une fable poétique et philosophique sur l\'amitié, l\'amour et le sens de la vie.', 'cover' => 'https://covers.openlibrary.org/b/id/12648519-M.jpg', 'annee' => 1943, 'pages' => 96, 'note' => 4.8, 'genre' => 'Fiction'],
            '7_kAiAk2RqMC' => ['titre' => 'Les Misérables', 'auteur' => 'Victor Hugo', 'desc' => 'Jean Valjean, ancien forçat, tente de se racheter dans une société injuste. Fresque monumentale de la France du XIXe siècle.', 'cover' => 'https://covers.openlibrary.org/b/id/12639617-M.jpg', 'annee' => 1862, 'pages' => 1488, 'note' => 4.6, 'genre' => 'Classique'],
            'P7kUAAAAYAAJ' => ['titre' => 'Le Comte de Monte-Cristo', 'auteur' => 'Alexandre Dumas', 'desc' => 'Edmond Dantès, injustement emprisonné, s\'évade et met en place une vengeance implacable contre ses ennemis.', 'cover' => 'https://covers.openlibrary.org/b/id/12639594-M.jpg', 'annee' => 1844, 'pages' => 1312, 'note' => 4.7, 'genre' => 'Aventure'],
            'wjMFAAAAQAAJ' => ['titre' => 'Madame Bovary', 'auteur' => 'Gustave Flaubert', 'desc' => 'Emma Bovary, étouffée par son mariage et la vie provinciale, cherche l\'évasion dans des aventures amoureuses aux conséquences tragiques.', 'cover' => 'https://covers.openlibrary.org/b/id/12639850-M.jpg', 'annee' => 1857, 'pages' => 400, 'note' => 4.2, 'genre' => 'Classique'],
            '9QnEDwAAQBAJ' => ['titre' => 'L\'Étranger', 'auteur' => 'Albert Camus', 'desc' => 'Meursault, un employé de bureau indifférent, commet un crime absurde sur une plage algérienne et confronte l\'absurdité du monde.', 'cover' => 'https://covers.openlibrary.org/b/id/12639823-M.jpg', 'annee' => 1942, 'pages' => 160, 'note' => 4.3, 'genre' => 'Philosophie'],
            'mCss0cIwnYwC' => ['titre' => 'Candide', 'auteur' => 'Voltaire', 'desc' => 'Candide, jeune naïf, parcourt le monde et découvre la cruauté et l\'absurdité de l\'existence. Un conte philosophique satirique.', 'cover' => 'https://covers.openlibrary.org/b/id/12639732-M.jpg', 'annee' => 1759, 'pages' => 176, 'note' => 4.1, 'genre' => 'Philosophie'],
            'jgJfAAAAcAAJ' => ['titre' => 'Le Rouge et le Noir', 'auteur' => 'Stendhal', 'desc' => 'Julien Sorel, jeune ambitieux, navigue entre l\'armée et l\'église dans une ascension sociale semée d\'intrigues et de passions.', 'cover' => 'https://covers.openlibrary.org/b/id/12639741-M.jpg', 'annee' => 1830, 'pages' => 576, 'note' => 4.2, 'genre' => 'Classique'],
            'nXxcCgAAQBAJ' => ['titre' => 'La Peste', 'auteur' => 'Albert Camus', 'desc' => 'La ville d\'Oran frappée par une épidémie de peste bouscule les certitudes et révèle le meilleur comme le pire de ses habitants.', 'cover' => 'https://covers.openlibrary.org/b/id/12639823-M.jpg', 'annee' => 1947, 'pages' => 320, 'note' => 4.4, 'genre' => 'Philosophie'],
            'jkIKAAAAYAAJ' => ['titre' => 'Les Fleurs du Mal', 'auteur' => 'Charles Baudelaire', 'desc' => 'Recueil de poèmes qui explore les thèmes de la beauté, de la mort, de l\'amour et du mal à travers une écriture d\'une modernité radicale.', 'cover' => 'https://covers.openlibrary.org/b/id/12639748-M.jpg', 'annee' => 1857, 'pages' => 256, 'note' => 4.5, 'genre' => 'Poésie'],
            '8tRbAAAAQAAJ' => ['titre' => 'Vingt mille lieues sous les mers', 'auteur' => 'Jules Verne', 'desc' => 'Le professeur Aronnax explore les abysses à bord du Nautilus du capitaine Nemo, vivant des aventures extraordinaires sous-marines.', 'cover' => 'https://covers.openlibrary.org/b/id/12639755-M.jpg', 'annee' => 1870, 'pages' => 384, 'note' => 4.2, 'genre' => 'Science-Fiction'],
            's1gVAAAAYAAJ' => ['titre' => 'Pride and Prejudice', 'auteur' => 'Jane Austen', 'desc' => 'Elizabeth Bennet, jeune femme intelligente et indépendante, navigue les conventions sociales et les jeux de l\'amour dans l\'Angleterre du XIXe siècle.', 'cover' => 'https://covers.openlibrary.org/b/id/12639317-M.jpg', 'annee' => 1813, 'pages' => 432, 'note' => 4.6, 'genre' => 'Romance'],
            'JTjFDwAAQBAJ' => ['titre' => 'Frankenstein', 'auteur' => 'Mary Shelley', 'desc' => 'Victor Frankenstein crée une créature vivante à partir de chairs mortes, déclenchant une tragédie qui le poursuivra jusqu\'aux confins du monde.', 'cover' => 'https://covers.openlibrary.org/b/id/12639344-M.jpg', 'annee' => 1818, 'pages' => 288, 'note' => 4.1, 'genre' => 'Science-Fiction'],
            '9GALAAAAYAAJ' => ['titre' => 'Dracula', 'auteur' => 'Bram Stoker', 'desc' => 'Le comte Dracula quitte sa Transylvanie natale pour semer la terreur en Angleterre. Le chasseur de vampires Van Helsing se lance à sa poursuite.', 'cover' => 'https://covers.openlibrary.org/b/id/12639357-M.jpg', 'annee' => 1897, 'pages' => 432, 'note' => 4.3, 'genre' => 'Horreur'],
            'MVYEAAAAYAAJ' => ['titre' => 'Alice\'s Adventures in Wonderland', 'auteur' => 'Lewis Carroll', 'desc' => 'Alice tombe dans un terrier de lapin et découvre un monde merveilleux peuplé de créatures étranges et de situations absurdes.', 'cover' => 'https://covers.openlibrary.org/b/id/12639370-M.jpg', 'annee' => 1865, 'pages' => 192, 'note' => 4.4, 'genre' => 'Fantastique'],
            'F1kUAQAAMAAJ' => ['titre' => 'The Adventures of Sherlock Holmes', 'auteur' => 'Arthur Conan Doyle', 'desc' => 'Le détective Sherlock Holmes et son fidèle Watson résolvent les mystères les plus énigmatiques du Londres victorien.', 'cover' => 'https://covers.openlibrary.org/b/id/12639383-M.jpg', 'annee' => 1892, 'pages' => 320, 'note' => 4.5, 'genre' => 'Policier'],
            'YAMNAQAAMAAJ' => ['titre' => 'A Tale of Two Cities', 'auteur' => 'Charles Dickens', 'desc' => 'Dans le tumulte de la Révolution française, des vies s\'entrecroisent entre Londres et Paris dans un récit de sacrifice et de rédemption.', 'cover' => 'https://covers.openlibrary.org/b/id/12639396-M.jpg', 'annee' => 1859, 'pages' => 544, 'note' => 4.3, 'genre' => 'Classique'],
            'QNZZAAAAYAAJ' => ['titre' => 'The Picture of Dorian Gray', 'auteur' => 'Oscar Wilde', 'desc' => 'Dorian Gray conserve sa jeunesse éternelle tandis que son portrait vieillit et porte les stigmates de ses péchés.', 'cover' => 'https://covers.openlibrary.org/b/id/12639409-M.jpg', 'annee' => 1890, 'pages' => 272, 'note' => 4.3, 'genre' => 'Philosophie'],
            '3HcFAAAAQAAJ' => ['titre' => 'Moby Dick', 'auteur' => 'Herman Melville', 'desc' => 'Le capitaine Achab poursuit obsessionnellement la baleine blanche Moby Dick à travers les océans, entraînant son équipage vers la tragédie.', 'cover' => 'https://covers.openlibrary.org/b/id/12639422-M.jpg', 'annee' => 1851, 'pages' => 720, 'note' => 4.0, 'genre' => 'Aventure'],
            'UukTAAAAYAAJ' => ['titre' => 'War and Peace', 'auteur' => 'Leo Tolstoy', 'desc' => 'Fresque épique de la société russe napoléonienne à travers le destin de plusieurs familles aristocratiques.', 'cover' => 'https://covers.openlibrary.org/b/id/12639435-M.jpg', 'annee' => 1869, 'pages' => 1392, 'note' => 4.4, 'genre' => 'Classique'],
            '7KxGAQAAMAAJ' => ['titre' => 'The Time Machine', 'auteur' => 'H.G. Wells', 'desc' => 'Un scientifique voyage dans le futur et découvre une humanité divisée en deux espèces : les Eloi et les Morlocks.', 'cover' => 'https://covers.openlibrary.org/b/id/12639448-M.jpg', 'annee' => 1895, 'pages' => 128, 'note' => 4.1, 'genre' => 'Science-Fiction'],
            'kotPYEqx7kMC' => ['titre' => '1984', 'auteur' => 'George Orwell', 'desc' => 'Dans un monde totalitaire où Big Brother vous regarde, Winston Smith tente de préserver son humanité face à un régime qui contrôle la vérité.', 'cover' => 'https://covers.openlibrary.org/b/id/12639461-M.jpg', 'annee' => 1949, 'pages' => 328, 'note' => 4.6, 'genre' => 'Science-Fiction'],
            'M5hZAAAAcAAJ' => ['titre' => 'The War of the Worlds', 'auteur' => 'H.G. Wells', 'desc' => 'L\'Angleterre victorienne envahie par des Martiens aux machines de guerre terrifiantes. Un récit de survie qui a inspiré des générations.', 'cover' => 'https://covers.openlibrary.org/b/id/12639474-M.jpg', 'annee' => 1898, 'pages' => 192, 'note' => 4.0, 'genre' => 'Science-Fiction'],
            'OicXAAAAYAAJ' => ['titre' => 'The Strange Case of Dr Jekyll and Mr Hyde', 'auteur' => 'Robert Louis Stevenson', 'desc' => 'Le docteur Jekyll découvre une potion qui le transforme en son double maléfique, Mr Hyde.', 'cover' => 'https://covers.openlibrary.org/b/id/12639487-M.jpg', 'annee' => 1886, 'pages' => 96, 'note' => 4.1, 'genre' => 'Horreur'],
            'vfJPAQAAMAAJ' => ['titre' => 'The Invisible Man', 'auteur' => 'H.G. Wells', 'desc' => 'Un scientifique découvre le secret de l\'invisibilité mais devient prisonnier de sa propre découverte, sombrant dans la folie.', 'cover' => 'https://covers.openlibrary.org/b/id/12639500-M.jpg', 'annee' => 1897, 'pages' => 160, 'note' => 4.0, 'genre' => 'Science-Fiction'],
            'WscQAAAAYAAJ' => ['titre' => 'The Island of Doctor Moreau', 'auteur' => 'H.G. Wells', 'desc' => 'Sur une île isolée, le docteur Moreau mène d\'horribles expériences pour transformer des animaux en êtres humains.', 'cover' => 'https://covers.openlibrary.org/b/id/12639513-M.jpg', 'annee' => 1896, 'pages' => 144, 'note' => 4.0, 'genre' => 'Science-Fiction'],
            '1IY9AQAAMAAJ' => ['titre' => 'Thus Spoke Zarathustra', 'auteur' => 'Friedrich Nietzsche', 'desc' => 'Le prophète Zarathoustra descend de sa montagne pour annoncer la mort de Dieu et la venue du Surhomme.', 'cover' => 'https://covers.openlibrary.org/b/id/12639526-M.jpg', 'annee' => 1883, 'pages' => 352, 'note' => 4.2, 'genre' => 'Philosophie'],
            'WEsJAAAAQAAJ' => ['titre' => 'The Republic', 'auteur' => 'Plato', 'desc' => 'Dialogue philosophique sur la justice, la cité idéale et le gouvernement des philosophes.', 'cover' => 'https://covers.openlibrary.org/b/id/12639539-M.jpg', 'annee' => -375, 'pages' => 416, 'note' => 4.3, 'genre' => 'Philosophie'],
            'GXFOAAAAcAAJ' => ['titre' => 'Les Essais', 'auteur' => 'Michel de Montaigne', 'desc' => 'Montaigne explore la condition humaine à travers une série de réflexions personnelles et philosophiques.', 'cover' => 'https://covers.openlibrary.org/b/id/12639762-M.jpg', 'annee' => 1580, 'pages' => 672, 'note' => 4.3, 'genre' => 'Philosophie'],
            'ShcGAAAAQAAJ' => ['titre' => 'Discours de la méthode', 'auteur' => 'René Descartes', 'desc' => 'Descartes expose sa méthode philosophique fondée sur le doute systématique et le célèbre « Je pense, donc je suis ».', 'cover' => 'https://covers.openlibrary.org/b/id/12639552-M.jpg', 'annee' => 1637, 'pages' => 128, 'note' => 4.1, 'genre' => 'Philosophie'],
            '1RoVAAAAQAAJ' => ['titre' => 'Le Contrat social', 'auteur' => 'Jean-Jacques Rousseau', 'desc' => 'Traité de philosophie politique sur la souveraineté du peuple et les fondements de la société légitime.', 'cover' => 'https://covers.openlibrary.org/b/id/12639565-M.jpg', 'annee' => 1762, 'pages' => 224, 'note' => 4.0, 'genre' => 'Philosophie'],
        ];

        if (!isset($localBooks[$volumeId])) {
            return null;
        }

        $b = $localBooks[$volumeId];
        return [
            'google_id' => $volumeId,
            'titre' => $b['titre'],
            'auteur' => $b['auteur'],
            'description' => $b['desc'],
            'cover_image' => str_replace('http:', 'https:', $b['cover']),
            'annee' => $b['annee'],
            'rating' => $b['note'],
            'total_pages' => $b['pages'],
            'preview_link' => "https://books.google.com/books?id={$volumeId}",
            'genre' => $b['genre'] ?? null,
        ];
    }

    private function fetchGoogleBookVolume(string $volumeId, string $apiKey): ?array
    {
        $url = "https://www.googleapis.com/books/v1/volumes/{$volumeId}";
        if ($apiKey) {
            $url .= "?key={$apiKey}";
        }
        try {
            $response = Http::timeout(10)->get($url);
            if ($response->successful()) {
                return $response->json();
            }
            $status = $response->status();
            \Log::warning("Google Books API error {$status} for volume {$volumeId}");
        } catch (\Exception $e) {
            \Log::error("Google Books connection error: " . $e->getMessage());
        }
        return null;
    }

    private function fetchFromOpenLibrary(string $volumeId): ?array
    {
        // Try OpenLibrary with the volume id as an OL id or ISBN
        $olUrls = [
            "https://openlibrary.org/api/books?bibkeys=OLID:{$volumeId}&format=json",
            "https://openlibrary.org/api/books?bibkeys=ISBN:{$volumeId}&format=json",
            "https://openlibrary.org/search.json?q={$volumeId}&limit=1",
        ];
        foreach ($olUrls as $olUrl) {
            try {
                $resp = Http::timeout(8)->get($olUrl);
                if (!$resp->successful()) continue;
                $data = $resp->json();
                // OpenLibrary API /api/books returns bibkey => data
                if (isset($data['OLID:' . $volumeId]) || isset($data['ISBN:' . $volumeId])) {
                    $key = isset($data['OLID:' . $volumeId]) ? 'OLID:' . $volumeId : 'ISBN:' . $volumeId;
                    $info = $data[$key];
                    $details = $info['details'] ?? $info['bib_key'] ?? null;
                    if ($details && isset($details['title'])) {
                        return [
                            'google_id' => 'ol_' . $volumeId,
                            'titre' => $details['title'] ?? 'Inconnu',
                            'auteur' => isset($details['authors']) ? (is_array($details['authors']) ? implode(', ', array_column($details['authors'], 'name')) : $details['authors']) : 'Inconnu',
                            'description' => substr($details['description'] ?? 'Livre provenant d\'OpenLibrary.', 0, 800),
                            'cover_image' => !empty($info['thumbnail_url']) ? str_replace('http:', 'https:', $info['thumbnail_url']) : null,
                            'annee' => $details['publish_date'] ?? null,
                            'rating' => null,
                            'total_pages' => $details['number_of_pages'] ?? null,
                            'preview_link' => $info['preview_url'] ?? null,
                            'genre' => null,
                        ];
                    }
                }
                // OpenLibrary search API returns docs[]
                if (isset($data['docs']) && count($data['docs']) > 0) {
                    $doc = $data['docs'][0];
                    return [
                        'google_id' => 'ol_' . ($doc['key'] ?? $volumeId),
                        'titre' => $doc['title'] ?? 'Inconnu',
                        'auteur' => isset($doc['author_name']) ? (is_array($doc['author_name']) ? implode(', ', $doc['author_name']) : $doc['author_name']) : 'Inconnu',
                        'description' => substr($doc['description'] ?? $doc['first_sentence'] ?? 'Livre provenant d\'OpenLibrary.', 0, 800),
                        'cover_image' => !empty($doc['cover_i']) ? "https://covers.openlibrary.org/b/id/{$doc['cover_i']}-M.jpg" : null,
                        'annee' => $doc['first_publish_year'] ?? null,
                        'rating' => null,
                        'total_pages' => $doc['number_of_pages_median'] ?? null,
                        'preview_link' => $doc['preview_url'] ?? null,
                        'genre' => isset($doc['subject']) ? (is_array($doc['subject']) ? $doc['subject'][0] : $doc['subject']) : null,
                    ];
                }
            } catch (\Exception $e) {}
        }
        return null;
    }
}
