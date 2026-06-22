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
}
