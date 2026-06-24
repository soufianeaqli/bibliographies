<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reference;
use App\Models\Reservation;
use App\Models\Favori;
use App\Models\HistoriqueLecture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    private array $stopWords = [
        'les','des','pour','dans','avec','sans','sur','tout','tous','toutes','une','est','pas',
        'plus','mais','donc','que','qui','quoi','faire','être','avoir','livre','cherche','livres',
        'cherché','cherchent','je','tu','il','elle','nous','vous','ils','elles','on','ce','cet',
        'cette','mon','ton','son','mes','tes','ses','notre','votre','leur','leurs','aux','en','y',
        'par','ou','et','ni','car','si','veux','peux','dois','sais','connais','trouve',
        'donne','montre','dis','vois','voir','savoir','connaître','trouver','donner','montrer',
        'dire','un','une','le','la','de','du','au','aux','est','sont','était','étaient',
        'a','ont','avaient','avait','été','besoin','aide','s\'il','vous','plaît',
        'stp','svp','peut','peuvent','pourrais','pourriez','voulez','voulais','peux',
        'aussi','trop','bien','très','assez','peu','encore','jamais','rien','quelque',
        'se','ce','cela','celui','celle','celles','ceux','même','toutes','aucun','aucune',
        'autre','autres','quel','quelle','quels','quelles','combien','comment','pourquoi',
        'quand','où','quel','lequel','laquelle','duquel','auquel','plusieurs','certains',
        'certaines','chaque','nière','nières','dont','auprès','grâce','façon','manière',
        // Mots déclencheurs d'intention (bruit pour la recherche)
        'détails','détail','détaillé','infos','info','parle','moi','présente','raconte',
        'décris','propos','disponible','existe','trouve','trouver','trouvé','auteur',
        'genre','catégorie','rayon','section','thème','domaine','recommand','suggère',
        'propose','conseille','dernier','nouveau','récent','ajouté','nouveauté',
        'populaire','meilleur','catalogue','bibliothèque','top','mieux','cœurs','coup',
        'cœur','avoir','exister','trouver','chercher','recherche','rechercher',
    ];

    public function ask(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:500']);

        $user = Auth::user();
        $message = trim(mb_strtolower($request->message));

        $mots = preg_split('/[^a-z0-9àâçéèêëîïôûùüÿœ\-]+/', $message);

        $resultats = collect();
        $reponse = '';
        $typeReponse = 'livres';
        $resultatsExternes = [];

        // Termes de recherche génériques pour l'API externe
        $termesGeneraux = $this->extraireTermes($mots);

        // --- 1. Aide ---
        if (preg_match('/\b(aide|help|que fais.tu|que peux.tu|commandes?|que puis.je|fonctionnalités?)\b/', $message)) {
            $count = Reference::where('type', 'livre')->count();
            $reponse = "Je suis l'assistant de la bibliothèque ({$count} livres). Je peux :\n".
                       "• recommander des livres\n".
                       "• chercher par titre, auteur ou genre\n".
                       "• donner des détails sur un livre\n".
                       "• chercher parmi tous les livres du monde (Google Books)\n".
                       "• afficher vos réservations, favoris, historique";
        }
        // --- 2. Salutations ---
        elseif (preg_match('/^(bonjour|salut|coucou|hey|hello|bonsoir)\b/', $message)) {
            $count = Reference::where('type', 'livre')->count();
            $prenom = $user->nom ? ' ' . explode(' ', trim($user->nom))[0] : '';
            $reponse = "Bonjour{$prenom} ! La bibliothèque compte {$count} livres.\n".
                       "Je peux aussi chercher des livres dans le monde entier via Google Books !\n".
                       "Demandez-moi :\n".
                       "• « recommande-moi un livre »\n".
                       "• « cherche [titre / auteur] »\n".
                       "• « détails sur [titre] »\n".
                       "• « [titre] disponible ? »";
        }
        // --- 3. Remerciements ---
        elseif (preg_match('/\b(merci|thanks|merci beaucoup|merci bien)\b/', $message)) {
            $reponse = 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions.';
        }
        // --- 4. Au revoir ---
        elseif (preg_match('/\b(au revoir|bye|à bientôt|à plus|à toute|ciao|adieu|bonne journée|bonne soirée)\b/', $message)) {
            $reponse = 'À bientôt ! Revenez quand vous voulez.';
        }
        // --- 5. Données personnelles ---
        elseif (preg_match('/\b(mes réservations|mes livres réservés|ma réservation|réservation active|réservations)\b/', $message)) {
            $reservations = Reservation::where('utilisateur_id', $user->id)
                ->with('reference')->latest()->get();
            if ($reservations->isEmpty()) {
                $reponse = 'Vous n\'avez aucune réservation active. Vous pouvez réserver un livre depuis sa page.';
            } else {
                $resultats = $reservations->map(fn($r) => $r->reference)->filter();
                $reponse = 'Vous avez ' . $resultats->count() . ' réservation(s) active(s) :';
            }
        }
        elseif (preg_match('/\b(mes favoris|mes livres favoris|mes livres préférés|mes préférés|mes coups de cœur|liste de souhaits|wishlist)\b/', $message)) {
            $favoris = Favori::where('utilisateur_id', $user->id)
                ->with('reference')->latest()->get();
            if ($favoris->isEmpty()) {
                $reponse = 'Vous n\'avez pas encore de favoris. Explorez la bibliothèque et ajoutez-en depuis la page des livres !';
            } else {
                $resultats = $favoris->map(fn($f) => $f->reference)->filter();
                $reponse = 'Vous avez ' . $resultats->count() . ' livre(s) en favori :';
            }
        }
        elseif (preg_match('/\b(mon historique|historique de lecture|mes lectures|déjà lu|mes livres lus|ce que j\'ai lu|dernières lectures)\b/', $message)) {
            $history = HistoriqueLecture::where('utilisateur_id', $user->id)
                ->with('reference')->latest()->get();
            if ($history->isEmpty()) {
                $reponse = 'Vous n\'avez pas encore d\'historique de lecture. Commencez à lire un livre depuis la bibliothèque !';
            } else {
                $resultats = $history->map(fn($h) => $h->reference)->filter()->unique('id')->values();
                $totalPages = $history->sum('last_page_read');
                $termines = $history->filter(fn($h) => ($h->progress_percentage ?? 0) >= 100)->count();
                $reponse = "Vous avez {$resultats->count()} livre(s) dans votre historique ({$totalPages} pages lues, {$termines} terminé(s)) :";
            }
        }
        // --- 6. Statistiques ---
        elseif (preg_match('/\b(combien\s*(de|y\s*a\s*t\s*il)?\s*livres?|nombre\s*(de|total)?\s*livres?|total\s*bibliothèque|taille\s*bibliothèque|bibliothèque\s*compte)\b/', $message)) {
            $count = Reference::where('type', 'livre')->count();
            $genres = Reference::where('type', 'livre')->whereNotNull('genre')->distinct()->count('genre');
            $auteurs = Reference::where('type', 'livre')->whereNotNull('auteur')->distinct()->count('auteur');
            $reponse = "La bibliothèque contient **{$count} livres**, de **{$auteurs} auteurs**, répartis dans **{$genres} genres**.";
        }
        // --- 7. Recommandations ---
        elseif (preg_match('/\b(recommande?|suggère?|propose?|top|meilleur|populaire|bien noté|coups de cœur|conseille?|les mieux)\b/', $message)) {
            $resultats = Reference::where('type', 'livre')
                ->where('rating', '>=', 4)
                ->orderBy('rating', 'desc')
                ->orderBy('id', 'desc')
                ->limit(6)
                ->get();
            $reponse = $resultats->isNotEmpty()
                ? 'Voici nos livres les mieux notés :'
                : 'Pas encore assez de notes. Voici quelques livres :';
            if ($resultats->isEmpty()) {
                $resultats = Reference::where('type', 'livre')->orderBy('id', 'desc')->limit(6)->get();
            }
        }
        // --- 8. Nouveautés ---
        elseif (preg_match('/\b(dernier|nouveau|récent|ajouté|nouveauté|nouvel)\b/', $message) && !preg_match('/\b(réservation|favori)\b/', $message)) {
            $resultats = Reference::where('type', 'livre')
                ->orderBy('id', 'desc')
                ->limit(6)
                ->get();
            $reponse = 'Voici les derniers livres ajoutés à la bibliothèque :';
        }
        // --- 9. Catalogue complet ---
        elseif (preg_match('/\b(tous les livres|liste des livres|catalogue|toute la bibliothèque|voir tout|afficher tout)\b/', $message)) {
            $total = Reference::where('type', 'livre')->count();
            $resultats = Reference::where('type', 'livre')
                ->orderBy('titre')
                ->limit(8)
                ->get();
            $reponse = "Voici un aperçu du catalogue ({$total} livres) :";
        }
        // --- 10. Par genre ---
        elseif (preg_match('/\b(genre|catégorie|rayon|section|thème|domaine)\b/', $message)) {
            $query = Reference::where('type', 'livre');
            $aMotsGenre = false;
            foreach ($mots as $mot) {
                $mot = preg_replace('/[^a-z0-9àâçéèêëîïôûùüÿœ\-]+/', '', $mot);
                if (mb_strlen($mot) < 2) continue;
                if (in_array($mot, $this->stopWords)) continue;
                if (in_array($mot, ['genre','catégorie','rayon','section','thème','domaine'])) continue;
                $aMotsGenre = true;
                $query->where('genre', 'like', "%{$mot}%");
            }
            if (!$aMotsGenre) {
                $genresListe = Reference::where('type', 'livre')->whereNotNull('genre')
                    ->distinct('genre')->pluck('genre')->sort()->values();
                $reponse = $genresListe->isNotEmpty()
                    ? 'Genres disponibles : ' . $genresListe->implode(', ') . '. Précisez votre recherche.'
                    : 'Aucun genre trouvé.';
            } else {
                $resultats = $query->orderBy('rating', 'desc')->limit(6)->get();
                if ($resultats->isEmpty() && !empty($termesGeneraux)) {
                    $resultatsExternes = $this->searchExterne($termesGeneraux, 6);
                    $reponse = !empty($resultatsExternes)
                        ? 'Aucun livre trouvé dans la bibliothèque pour ce genre. Résultats web :'
                        : 'Aucun livre trouvé pour ce genre.';
                } else {
                    $reponse = 'Livres trouvés pour ce genre :';
                }
            }
        }
        // --- 11. Détails / présentation d'un livre ---
        elseif (preg_match('/\b(parle.?moi|détails?|détaillé|infos?\s*sur|qu\'est.ce.que|c\'est quoi|présente.?moi|raconte.?moi|décris.?moi|à propos\s*de)\b/', $message)) {
            $resultats = $this->rechercherLivres($mots, ['titre', 'auteur'], 4);
            $typeReponse = 'detail';
            if ($resultats->isEmpty() && !empty($termesGeneraux)) {
                $resultatsExternes = $this->searchExterne($termesGeneraux, 4);
                if (!empty($resultatsExternes)) {
                    $reponse = 'Je n\'ai pas trouvé ce livre dans notre bibliothèque. Résultats web :';
                } else {
                    $reponse = 'Je n\'ai trouvé ce livre ni dans la bibliothèque ni sur le web. Essayez autre chose.';
                }
            } else {
                $reponse = $resultats->isNotEmpty()
                    ? 'Voici les détails que j\'ai trouvés :'
                    : 'Je n\'ai pas trouvé ce livre. Vérifiez l\'orthographe.';
            }
        }
        // --- 12. Disponibilité ---
        elseif (preg_match('/\b(disponible|existe.?t.il|est.ce.qu\'il\s*y\s*a|trouve.?t.on|y.a.t.il|avez.vous|est ce que vous avez)\b/', $message)) {
            $resultats = $this->rechercherLivres($mots, ['titre', 'auteur', 'genre'], 5);
            if ($resultats->isEmpty() && !empty($termesGeneraux)) {
                $resultatsExternes = $this->searchExterne($termesGeneraux, 5);
                $reponse = $resultatsExternes
                    ? 'Ce livre n\'est pas dans notre bibliothèque, mais je l\'ai trouvé sur Google Books :'
                    : 'Je n\'ai trouvé ce livre ni ici ni sur Google Books.';
            } else {
                $reponse = $resultats->isNotEmpty()
                    ? 'Oui, ce(s) livre(s) est/sont disponible(s) dans notre bibliothèque :'
                    : 'Aucun résultat trouvé.';
            }
        }
        // --- 13. Par auteur ---
        elseif (preg_match('/\b(auteur|écrit\s*par|livre\s*de)\b/', $message)) {
            $resultats = $this->rechercherLivres($mots, ['auteur'], 6);
            if ($resultats->isEmpty() && !empty($termesGeneraux)) {
                $resultatsExternes = $this->searchExterne($termesGeneraux, 6);
                $reponse = !empty($resultatsExternes)
                    ? 'Aucun livre trouvé dans notre bibliothèque pour cet auteur. Résultats web :'
                    : 'Aucun livre trouvé pour cet auteur.';
            } else {
                $reponse = $resultats->isNotEmpty()
                    ? 'Livres de cet auteur (bibliothèque) :'
                    : 'Aucun livre trouvé pour cet auteur.';
            }
        }
        // --- 14. Recherche générale ---
        else {
            if (empty($termesGeneraux)) {
                $resultats = Reference::where('type', 'livre')
                    ->inRandomOrder()
                    ->limit(5)
                    ->get();
                $reponse = 'Voici quelques livres de la bibliothèque :';
            } else {
                $query = Reference::where('type', 'livre');
                foreach ($termesGeneraux as $t) {
                    $query->where(function ($q) use ($t) {
                        $q->where('titre', 'like', "%{$t}%")
                          ->orWhere('auteur', 'like', "%{$t}%")
                          ->orWhere('description', 'like', "%{$t}%")
                          ->orWhere('genre', 'like', "%{$t}%");
                    });
                }
                $resultats = $query->orderBy('rating', 'desc')->orderBy('id', 'desc')->limit(6)->get();
                $terme = implode(' ', array_slice($termesGeneraux, 0, 4));

                $resultatsExternes = $this->searchExterne($termesGeneraux, 4);

                if ($resultats->isNotEmpty() && !empty($resultatsExternes)) {
                    $reponse = "Résultats pour « {$terme} » (bibliothèque + web) :";
                } elseif ($resultats->isNotEmpty()) {
                    $reponse = "Résultats pour « {$terme} » dans la bibliothèque :";
                } elseif (!empty($resultatsExternes)) {
                    $reponse = "Introuvable dans la bibliothèque. Résultats web pour « {$terme} » :";
                } else {
                    $reponse = "Désolé, je n'ai rien trouvé pour « {$terme} ».";
                }
            }
        }

        // --- Fallback : uniquement si aucune réponse ni résultat n'a été produit ---
        if ($resultats->isEmpty() && empty($resultatsExternes) && $reponse === '') {
            $resultats = Reference::where('type', 'livre')
                ->inRandomOrder()
                ->limit(4)
                ->get();
            $reponse = 'Voici quelques livres disponibles :';
        }

        // --- Formatage de la réponse ---
        $livres = $resultats->map(fn($b) => [
            'id'            => $b->id,
            'titre'         => $b->titre,
            'auteur'        => $b->auteur,
            'genre'         => $b->genre,
            'annee'         => $b->annee,
            'rating'        => (float) ($b->rating ?? 0),
            'total_pages'   => (int) ($b->total_pages ?? 0),
            'description'   => mb_substr($b->description ?? '', 0, 350) ?: null,
            'cover_image'   => $b->cover_image && !str_starts_with($b->cover_image, 'http')
                ? url('storage/' . $b->cover_image)
                : $b->cover_image,
            'source'        => 'bibliotheque',
            'date_creation' => $b->date_creation?->format('d/m/Y'),
            'video_url'     => $b->video_url,
            'publisher'     => null,
            'language'      => null,
        ]);

        // Ajouter les résultats externes (Google Books)
        foreach ($resultatsExternes as $ext) {
            $livres->push([
                'id'            => $ext['id'],
                'titre'         => $ext['titre'],
                'auteur'        => $ext['auteur'],
                'genre'         => $ext['genre'],
                'annee'         => $ext['annee'],
                'rating'        => $ext['rating'],
                'total_pages'   => $ext['total_pages'],
                'description'   => mb_substr($ext['description'] ?? '', 0, 350) ?: null,
                'cover_image'   => $ext['cover_image'],
                'source'        => $ext['source'] ?? 'web',
                'publisher'     => $ext['publisher'] ?? null,
                'language'      => $ext['language'] ?? null,
                'isbn_10'       => $ext['isbn_10'] ?? null,
                'isbn_13'       => $ext['isbn_13'] ?? null,
                'isbn'          => $ext['isbn'] ?? null,
                'date_creation' => $ext['date_creation'] ?? null,
                'video_url'     => $ext['video_url'] ?? null,
            ]);
        }

        $hasExternes = !empty($resultatsExternes);

        return response()->json([
            'reponse'     => $reponse,
            'livres'      => $livres->take(10)->values(),
            'source'      => $hasExternes ? 'mixte' : 'bibliotheque',
        ]);
    }

    private function searchGoogleBooks(array $termes, int $limite = 5): array
    {
        if (empty($termes)) return [];

        $query = urlencode(implode(' ', $termes));
        $apiKey = env('GOOGLE_BOOKS_API_KEY', '');
        $url = "https://www.googleapis.com/books/v1/volumes?q={$query}&maxResults={$limite}";

        if ($apiKey) {
            $url .= "&key={$apiKey}";
        }

        try {
            $response = Http::timeout(8)->get($url);
            if (!$response->successful()) return [];
            $items = $response->json('items') ?? [];
        } catch (\Exception $e) {
            return [];
        }

        $results = [];
        foreach ($items as $item) {
            $info = $item['volumeInfo'] ?? [];
            $identifiers = collect($info['industryIdentifiers'] ?? [])
                ->pluck('identifier', 'type')->toArray();
            $results[] = [
                'id'            => 'ext_' . ($item['id'] ?? uniqid()),
                'titre'         => $info['title'] ?? 'Sans titre',
                'auteur'        => isset($info['authors'])
                    ? (is_array($info['authors']) ? implode(', ', $info['authors']) : $info['authors'])
                    : 'Inconnu',
                'genre'         => !empty($info['categories']) ? implode(', ', $info['categories']) : null,
                'annee'         => !empty($info['publishedDate']) ? (int) substr($info['publishedDate'], 0, 4) : null,
                'rating'        => (float) ($info['averageRating'] ?? 0),
                'total_pages'   => (int) ($info['pageCount'] ?? 0),
                'description'   => mb_substr($info['description'] ?? '', 0, 350),
                'cover_image'   => !empty($info['imageLinks']['thumbnail'])
                    ? str_replace(['http:', '&edge=curl'], ['https:', ''], $info['imageLinks']['thumbnail'])
                    : null,
                'source'        => 'google_books',
                'publisher'     => $info['publisher'] ?? null,
                'language'      => $info['language'] ?? null,
                'isbn_10'       => $identifiers['ISBN_10'] ?? null,
                'isbn_13'       => $identifiers['ISBN_13'] ?? null,
                'date_creation' => null,
                'video_url'     => null,
            ];
        }
        return $results;
    }

    private function searchOpenLibrary(array $termes, int $limite = 5): array
    {
        if (empty($termes)) return [];

        $query = urlencode(implode(' ', $termes));
        $url = "https://openlibrary.org/search.json?q={$query}&limit={$limite}&fields=key,title,author_name,first_sentence,subject,description,cover_i,publish_year";

        try {
            $resp = Http::timeout(8)->get($url);
            if (!$resp->successful()) return [];
            $docs = $resp->json('docs') ?? [];
        } catch (\Exception $e) {
            return [];
        }

        $results = [];
        foreach ($docs as $doc) {
            $coverId = $doc['cover_i'] ?? null;
            $results[] = [
                'id'            => 'ext_ol_' . ($doc['key'] ?? uniqid()),
                'titre'         => $doc['title'] ?? 'Sans titre',
                'auteur'        => !empty($doc['author_name'])
                    ? (is_array($doc['author_name']) ? implode(', ', $doc['author_name']) : $doc['author_name'])
                    : 'Inconnu',
                'genre'         => !empty($doc['subject'])
                    ? (is_array($doc['subject']) ? implode(', ', array_slice($doc['subject'], 0, 5)) : $doc['subject'])
                    : null,
                'annee'         => !empty($doc['publish_year']) ? (int) $doc['publish_year'][0] : null,
                'rating'        => 0,
                'total_pages'   => (int) ($doc['number_of_pages_median'] ?? 0),
                'description'   => !empty($doc['first_sentence'])
                    ? (is_array($doc['first_sentence']) ? $doc['first_sentence'][0] : $doc['first_sentence'])
                    : null,
                'cover_image'   => $coverId
                    ? "https://covers.openlibrary.org/b/id/{$coverId}-M.jpg"
                    : null,
                'source'        => 'open_library',
                'publisher'     => !empty($doc['publisher']) ? (is_array($doc['publisher']) ? $doc['publisher'][0] : $doc['publisher']) : null,
                'language'      => !empty($doc['language']) ? (is_array($doc['language']) ? $doc['language'][0] : $doc['language']) : null,
                'isbn'          => !empty($doc['isbn']) ? (is_array($doc['isbn']) ? $doc['isbn'][0] : $doc['isbn']) : null,
                'date_creation' => null,
                'video_url'     => null,
            ];
        }
        return $results;
    }

    private function searchExterne(array $termes, int $limite = 5): array
    {
        $results = $this->searchGoogleBooks($termes, $limite);
        if (!empty($results)) return $results;

        return $this->searchOpenLibrary($termes, $limite);
    }

    private function extraireTermes(array $mots): array
    {
        $termes = [];
        foreach ($mots as $mot) {
            $mot = preg_replace('/[^a-z0-9àâçéèêëîïôûùüÿœ\-]+/', '', $mot);
            if (mb_strlen($mot) < 3) continue;
            if (in_array($mot, $this->stopWords)) continue;
            $termes[] = $mot;
        }
        return array_values(array_unique($termes));
    }

    private function rechercherLivres(array $mots, array $champs, int $limite = 6)
    {
        $termes = $this->extraireTermes($mots);
        if (empty($termes)) return collect();

        $query = Reference::where('type', 'livre');
        foreach ($termes as $t) {
            $query->where(function ($q) use ($t, $champs) {
                foreach ($champs as $c) {
                    $q->orWhere($c, 'like', "%{$t}%");
                }
            });
        }
        return $query->orderBy('rating', 'desc')->orderBy('id', 'desc')->limit($limite)->get();
    }
}
