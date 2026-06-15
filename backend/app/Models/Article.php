<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sous-type Article (hérite de Reference, même clé primaire `id`).
 *
 * @property int         $id
 * @property string|null $revue
 * @property string|null $volume
 * @property string|null $numero
 * @property string|null $pages
 * @property string|null $doi
 */
class Article extends Model
{
    protected $table = 'article';

    public $timestamps = false;

    /** L'id n'est pas auto-incrémenté : il provient de la table reference. */
    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'revue',
        'volume',
        'numero',
        'pages',
        'doi',
    ];

    /** Référence parente (partage la même clé primaire). */
    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class, 'id', 'id');
    }
}
