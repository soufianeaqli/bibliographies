<?php
namespace App\Console\Commands;

use App\Models\Reference;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class CheckCache extends Command
{
    protected $signature = 'books:check-cache';
    protected $description = 'Check cached fulltext lengths';

    public function handle()
    {
        $books = Reference::where('type', 'livre')->get();
        $headers = ['ID', 'Titre', 'Chars', 'Source'];
        $rows = [];
        foreach ($books as $b) {
            $key = 'book_fulltext_v5_' . md5($b->titre . '|' . $b->auteur);
            if (Cache::has($key)) {
                $data = Cache::get($key);
                $len = mb_strlen($data['full_text'] ?? '');
                // Déterminer si c'est Gutenberg ou fallback
                $source = $len > 5000 ? 'GUTENBERG' : ($len > 200 ? 'PREVIEW' : 'COURT');
                $rows[] = [$b->id, mb_substr($b->titre, 0, 30), $len, $source];
            } else {
                $rows[] = [$b->id, mb_substr($b->titre, 0, 30), 0, 'PAS ENCACHE'];
            }
        }
        $this->table($headers, $rows);

        $totalChars = array_sum(array_column($rows, 2));
        $gutenbergCount = count(array_filter($rows, fn($r) => $r[3] === 'GUTENBERG'));
        $this->newLine();
        $this->info("Total chars: $totalChars");
        $this->info("Livres Gutenberg: $gutenbergCount / {$books->count()}");
    }
}
