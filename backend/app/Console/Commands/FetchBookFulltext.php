<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\BookDetailController;
use App\Models\Reference;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class FetchBookFulltext extends Command
{
    protected $signature = 'books:fetch-fulltext {--force : Ignorer le cache et re-télécharger}';
    protected $description = 'Pré-remplit le cache Gutenberg pour tous les livres';

    public function handle(BookDetailController $controller)
    {
        $books = Reference::where('type', 'livre')->get();
        $total = $books->count();
        $success = 0;
        $failed = 0;

        $this->info("Traitement de {$total} livres...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($books as $book) {
            $cacheKey = 'book_fulltext_v5_' . md5($book->titre . '|' . $book->auteur);

            if ($this->option('force')) {
                Cache::forget($cacheKey);
            }

            if (Cache::has($cacheKey)) {
                $bar->advance();
                $success++;
                continue;
            }

            try {
                $response = $controller->getPages($book->id);
                $data = $response->getData();
                if (!empty($data->full_text) && strlen($data->full_text) > 500) {
                    $success++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Terminé : {$success} succès, {$failed} échecs sur {$total} livres");
    }
}
