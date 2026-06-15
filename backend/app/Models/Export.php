<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Entité Export : citation générée (APA, IEEE, BibTeX) d'une référence ou
 * d'une collection, conservée pour l'historique.
 *
 * @property int         $id
 * @property string      $format   apa|ieee|bibtex
 * @property string      $contenu
 * @property int         $utilisateur_id
 * @property int|null    $reference_id
 * @property int|null    $collection_id
 */
class Export extends Model
{
    protected $table = 'export';

    public $timestamps = false;

    protected $fillable = [
        'format',
        'contenu',
        'date_export',
        'utilisateur_id',
        'reference_id',
        'collection_id',
    ];

    protected function casts(): array
    {
        return [
            'date_export' => 'datetime',
        ];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class, 'reference_id');
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class, 'collection_id');
    }
}
