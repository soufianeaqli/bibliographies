<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reference;
use App\Models\Reservation;
use App\Models\HistoriqueLecture;
use App\Models\Bookmark;
use App\Models\Avis;
use App\Models\Favori;
use App\Models\Notification;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

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

        $user = Auth::user();
        $book->can_read = $user && $user->estAdministrateur()
            ? true
            : Reservation::where('reference_id', $id)
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

        // Notify all admins
        $admins = Utilisateur::where('role', 'administrateur')->get();
        $userName = Auth::user()->nom;
        $bookTitle = $reference->titre;
        foreach ($admins as $admin) {
            Notification::create([
                'utilisateur_id' => $admin->id,
                'type' => 'new_reservation',
                'message' => "{$userName} a réservé « {$bookTitle} ».",
                'reference_id' => $id,
            ]);
        }

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

    public function addFavori($id)
    {
        $reference = Reference::findOrFail($id);

        $existing = Favori::where('utilisateur_id', Auth::id())
            ->where('reference_id', $id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Déjà dans vos favoris.', 'favori' => true]);
        }

        $favori = Favori::create([
            'utilisateur_id' => Auth::id(),
            'reference_id' => $id,
        ]);

        return response()->json(['message' => 'Ajouté aux favoris !', 'favori' => true], 201);
    }

    public function removeFavori($id)
    {
        Favori::where('utilisateur_id', Auth::id())
            ->where('reference_id', $id)
            ->delete();

        return response()->json(['message' => 'Retiré des favoris.', 'favori' => false]);
    }

    public function getFavoris()
    {
        $favoris = Favori::where('utilisateur_id', Auth::id())
            ->with('reference')
            ->orderBy('created_at', 'desc')
            ->get();

        $favoris->transform(function ($fav) {
            if ($fav->reference && $fav->reference->cover_image && !str_starts_with($fav->reference->cover_image, 'http')) {
                $fav->reference->cover_image = url('storage/' . $fav->reference->cover_image);
            }
            return $fav;
        });

        return response()->json($favoris);
    }

    public function isFavori($id)
    {
        $exists = Favori::where('utilisateur_id', Auth::id())
            ->where('reference_id', $id)
            ->exists();

        return response()->json(['favori' => $exists]);
    }

    public function getMyReservations()
    {
        $reservations = Reservation::where('utilisateur_id', Auth::id())
            ->with('reference')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reservations);
    }

    public function getPages($id)
    {
        $book = Reference::findOrFail($id);
        $googleKey = env('GOOGLE_BOOKS_API_KEY', '');

        $cacheKey = 'book_fulltext_v5_' . md5($book->titre . '|' . $book->auteur);

        $data = Cache::remember($cacheKey, 86400, function () use ($book, $googleKey) {
            // 1 — Project Gutenberg : texte intégral du livre (centaines de pages)
            $gutenbergText = $this->fetchGutenbergText($book);
            if ($gutenbergText && mb_strlen($gutenbergText) >= 5000) {
                $fullText = $this->buildBookSections($book) . "\n\n" . $gutenbergText;
                return $this->buildResponse($book, $fullText);
            }

            // 2 — Google Books API (10 snippets + description longue)
            $allText = $this->fetchGoogleBooksText($book, $googleKey) ?? '';

            // 3 — Open Library (gratuit, sans clé)
            if (mb_strlen($allText) < 800) {
                $olText = $this->fetchOpenLibraryText($book);
                if ($olText) $allText .= "\n\n" . $olText;
            }

            // 4 — Génération de contenu synthétique si pas assez de texte
            if (mb_strlen($allText) < 200) {
                $allText = $this->generateBookContent($book);
            }

            $sections = $this->buildBookSections($book);
            $fullText = $sections . "\n\n" . $allText;

            return $this->buildResponse($book, $fullText);
        });

        return response()->json($data);
    }

    private function generateBookContent($book): string
    {
        $desc = $book->description ?? 'Aucune description disponible.';
        $titre = $book->titre;
        $auteur = $book->auteur;
        $annee = $book->annee ?? 'inconnue';
        $pages = $book->total_pages ?? 300;
        $nbChapitres = max(3, min(12, (int) ceil($pages / 40)));

        // Générer des chapitres basés sur la description
        $phrases = preg_split('/[.!?]+/', $desc);
        $phrases = array_map('trim', $phrases);
        $phrases = array_filter($phrases, fn($p) => mb_strlen($p) > 20);
        $phrases = array_values($phrases);

        if (empty($phrases)) {
            $phrases = ["{$titre} est une œuvre majeure de {$auteur}"];
        }

        $contenu = "{$titre}\n{$auteur}\n\n";
        $contenu .= "Publié en {$annee}, cet ouvrage de {$pages} pages est une référence incontournable.\n\n";

        for ($i = 1; $i <= $nbChapitres; $i++) {
            $contenu .= "\n--- Chapitre {$i} ---\n\n";

            $phraseBase = $phrases[$i % count($phrases)];
            $variations = [
                "{$phraseBase}. Cette section du livre explore en profondeur les implications de ce thème central.",
                "L'auteur développe ici une analyse remarquable : {$phraseBase}. Les arguments présentés témoignent d'une érudition rare.",
                "{$phraseBase}. Ce chapitre apporte un éclairage nouveau sur la question, invitant le lecteur à une réflexion approfondie.",
                "Dans ce passage, {$auteur} examine les différentes facettes du sujet. {$phraseBase}. La démonstration est rigoureuse et captivante.",
                "{$phraseBase}. Ce développement s'inscrit dans la continuité des chapitres précédents, enrichissant la thèse centrale de l'ouvrage.",
                "L'un des apports essentiels de ce chapitre est la mise en perspective historique. {$phraseBase}. L'analyse de {$auteur} reste d'une grande actualité.",
                "{$phraseBase}. À travers cet exemple concret, l'auteur illustre parfaitement son propos et permet au lecteur de mieux saisir les enjeux.",
                "Ce chapitre aborde un aspect fondamental : {$phraseBase}. {$auteur} y déploie tout son talent de pédagogue et de penseur.",
            ];

            // 3 à 6 paragraphes par chapitre
            $nbParagraphes = rand(3, 6);
            for ($j = 0; $j < $nbParagraphes; $j++) {
                $idx = ($i + $j) % count($variations);
                $contenu .= $variations[$idx] . "\n\n";
            }
        }

        $contenu .= "\n--- Conclusion ---\n\n";
        $contenu .= "{$titre} de {$auteur} ({$annee}) demeure une œuvre essentielle. ";
        $contenu .= "Sa lecture offre des perspectives uniques et une compréhension enrichie des thèmes abordés. ";
        $contenu .= "Cet ouvrage continue d'influencer et d'inspirer des lecteurs à travers le monde.\n";

        return $contenu;
    }

    private function buildResponse($book, $fullText)
    {
        return [
            'volumeId' => $book->epub_path,
            'total_pages' => $book->total_pages ?? 0,
            'full_text' => $fullText ?: null,
            'book_pdf_path' => $book->pdf_path ? url('storage/' . $book->pdf_path) : null,
            'pdf_available' => false,
            'epub_available' => false,
            'preview_link' => $book->epub_path,
        ];
    }

    private function fetchGutenbergText($book)
    {
        try {
            $titre = $book->titre;
            $auteur = $book->auteur;

            // Normaliser les accents pour la recherche
            $normalize = fn($s) => str_replace(
                ['é', 'è', 'ê', 'ë', 'à', 'â', 'ä', 'ù', 'û', 'ü', 'ô', 'ö', 'î', 'ï', 'ç'],
                ['e', 'e', 'e', 'e', 'a', 'a', 'a', 'u', 'u', 'u', 'o', 'o', 'i', 'i', 'c'],
                mb_strtolower($s)
            );

            // Carte de traductions français → anglais pour les classiques
            $enMap = [
                'comte de monte-cristo' => 'Count of Monte Cristo',
                'guerre des mondes' => 'War of the Worlds',
                'vingt mille' => '20000 Leagues Under the Sea',
                'fleurs du mal' => 'Flowers of Evil',
                'art de la guerre' => 'Art of War',
                'pensees pour moi-meme' => 'Meditations',
                'petit prince' => 'Little Prince',
            ];

            $queries = [
                "{$titre} {$auteur}",
                $titre,
                $auteur,
            ];
            $titreLower = $normalize($titre);
            foreach ($enMap as $fr => $en) {
                if (str_contains($titreLower, $fr)) {
                    $queries[] = "{$en} {$auteur}";
                    $queries[] = $en;
                }
            }

            $foundId = null;
            foreach (array_unique($queries) as $q) {
                $isEnQuery = false;
                $qLower = $normalize($q);
                // Détecter si cette requête est une variante anglaise
                foreach ($enMap as $en) {
                    $enNorm = $normalize($en);
                    if (str_contains($qLower, $enNorm)) {
                        $isEnQuery = true;
                        break;
                    }
                }

                $url = 'https://gutendex.com/books?search=' . urlencode($q);
                $resp = Http::connectTimeout(10)->timeout(15)->get($url);
                if (!$resp->successful()) continue;

                $results = $resp->json('results') ?? [];
                foreach ($results as $r) {
                    $gId = $r['id'] ?? 0;
                    $gTitle = $r['title'] ?? '';
                    if (!$gId) continue;

                    // Vérifier l'auteur (normalisé, sans accents)
                    $auteurNorm = $normalize($auteur);
                    $auteurWords = preg_split('/[\s.]+/', $auteurNorm);
                    $authors = $r['authors'] ?? [];
                    $authorMatch = false;
                    foreach ($authors as $a) {
                        $name = $normalize($a['name'] ?? '');
                        foreach ($auteurWords as $aw) {
                            if (mb_strlen($aw) < 3) continue;
                            if (str_contains($name, $aw)) {
                                $authorMatch = true;
                                break 2;
                            }
                        }
                    }
                    if (!$authorMatch) continue;

                    // Vérifier le titre (normalisé)
                    $gTitleNorm = $normalize($gTitle);
                    $titreWords = preg_split('/[\s\'\-]+/', $normalize($titre));
                    $matchCount = 0;
                    $longWords = [];
                    foreach ($titreWords as $w) {
                        if (mb_strlen($w) < 3) continue;
                        $longWords[] = $w;
                        if (str_contains($gTitleNorm, $w)) $matchCount++;
                    }
                    $needed = max(1, min(2, count($longWords)));

                    // Accepte si titre français correspond OU si requête anglaise ET mots-clés correspondent
                    if ($matchCount >= $needed) {
                        $foundId = $gId;
                        break 2;
                    }

                    // Pour les requêtes anglaises : vérifier les mots de la requête dans le titre
                    if ($isEnQuery) {
                        $queryWords = preg_split('/[\s\'\-]+/', $qLower);
                        $queryMatch = 0;
                        foreach ($queryWords as $qw) {
                            if (mb_strlen($qw) < 3) continue;
                            if (str_contains($gTitleNorm, $qw)) $queryMatch++;
                        }
                        if ($queryMatch >= 1) {
                            $foundId = $gId;
                            break 2;
                        }
                    }
                }
            }

            if (!$foundId) return null;

            $textUrl = "https://www.gutenberg.org/cache/epub/{$foundId}/pg{$foundId}.txt";
            $textResp = Http::connectTimeout(15)->timeout(45)->get($textUrl);
            if (!$textResp->successful()) return null;

            $text = $textResp->body();
            $text = preg_replace('/^.*?\*{3}\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*{3}/s', '', $text);
            $text = preg_replace('/\*{3}\s*END OF (THE|THIS) PROJECT GUTENBERG EBOOK.*$/s', '', $text);
            $text = trim($text);
            if (mb_strlen($text) < 1000) return null;

            return mb_substr($text, 0, 300000);
        } catch (\Exception $e) {
            return null;
        }
    }

    private function buildBookSections($book)
    {
        $sections = [];
        $sections[] = "Présentation de l'ouvrage\n« {$book->titre} » — {$book->auteur}";
        $sections[] = "Informations bibliographiques\nTitre : {$book->titre}\nAuteur : {$book->auteur}\nAnnée de publication : {$book->annee}\nNombre de pages : {$book->total_pages}";
        if ($book->description) {
            $sections[] = "Résumé\n{$book->description}";
        }
        $sections[] = "Genres et disciplines\nOuvrage de type « {$book->type} », cette œuvre s'inscrit dans le domaine de la littérature et de la recherche académique.";
        return implode("\n\n", $sections);
    }

    private function fetchGoogleBooksText($book, $googleKey)
    {
        $query = urlencode("\"{$book->titre}\" {$book->auteur}");
        $searchUrl = "https://www.googleapis.com/books/v1/volumes?q={$query}&maxResults=10";
        if ($googleKey) {
            $searchUrl .= "&key={$googleKey}";
        }

        try {
            $searchResp = Http::timeout(10)->get($searchUrl);
            if (!$searchResp->successful()) return null;
            $items = $searchResp->json('items') ?? [];
            if (empty($items)) return null;

            $allSnippets = [];
            $volumeId = null;
            foreach (array_slice($items, 0, 10) as $item) {
                if (!$volumeId && !empty($item['id'])) {
                    $volumeId = $item['id'];
                }
                if (!empty($item['searchInfo']['textSnippet'])) {
                    $allSnippets[] = strip_tags($item['searchInfo']['textSnippet']);
                }
            }

            if (!$volumeId) return null;

            $detailUrl = "https://www.googleapis.com/books/v1/volumes/{$volumeId}";
            if ($googleKey) $detailUrl .= "?key={$googleKey}";

            $detailResp = Http::timeout(10)->get($detailUrl);
            if (!$detailResp->successful()) {
                return $allSnippets ? implode(' ', $allSnippets) : null;
            }

            $vol = $detailResp->json();
            $volInfo = $vol['volumeInfo'] ?? [];
            $accessInfo = $vol['accessInfo'] ?? [];
            $description = $volInfo['description'] ?? $book->description ?? '';

            $pdfLink = $accessInfo['pdf']['downloadLink'] ?? null;
            $pdfAvailable = $accessInfo['pdf']['isAvailable'] ?? false;
            if ($pdfAvailable && $pdfLink && !$book->pdf_path) {
                $this->downloadBookPdf($book, $pdfLink);
            }

            $snippetsText = implode(' ', $allSnippets);
            return trim($description . "\n\n" . $snippetsText);
        } catch (\Exception $e) {
            return null;
        }
    }

    private function fetchOpenLibraryText($book)
    {
        try {
            $query = urlencode("{$book->titre} {$book->auteur}");
            $url = "https://openlibrary.org/search.json?q={$query}&limit=1&fields=key,title,author_name,first_sentence,subject,description";
            $resp = Http::timeout(10)->get($url);
            if (!$resp->successful()) return null;

            $docs = $resp->json('docs') ?? [];
            if (empty($docs)) return null;

            $doc = $docs[0];
            $parts = [];

            if (!empty($doc['first_sentence'])) {
                $fs = is_array($doc['first_sentence']) ? ($doc['first_sentence'][0] ?? '') : $doc['first_sentence'];
                if ($fs) $parts[] = $fs;
            }

            if (!empty($doc['subject'])) {
                $subjects = array_slice((array)$doc['subject'], 0, 8);
                $parts[] = "Thèmes abordés : " . implode(', ', $subjects) . ".";
            }

            return $parts ? implode("\n\n", $parts) : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function downloadBookPdf($book, $pdfUrl)
    {
        if (!$pdfUrl) return null;

        $filename = 'book_' . $book->id . '_' . time() . '.pdf';
        $directory = 'public/books/pdfs';
        $fullPath = storage_path('app/' . $directory . '/' . $filename);

        if (!is_dir(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        try {
            $response = Http::timeout(30)->sink($fullPath)->get($pdfUrl);
            if ($response->successful()) {
                $relativePath = 'books/pdfs/' . $filename;
                $book->update(['pdf_path' => $relativePath]);
                return $relativePath;
            }
        } catch (\Exception $e) {
            // Échec du téléchargement, on ignore
        }

        return null;
    }
}
