<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Entité Collection : regroupement nommé de références appartenant à un
 * utilisateur (ex. « PFE 2025 »).
 *
 * @property int    $id
 * @property string $nom
 * @property int    $utilisateur_id
 */
class Collection extends Model
{
    protected $table = 'collection';

    public $timestamps = false;

    protected $fillable = [
        'nom',
        'date_creation',
        'utilisateur_id',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'datetime',
        ];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    /** Références regroupées dans la collection (N:N). */
    public function references(): BelongsToMany
    {
        return $this->belongsToMany(Reference::class, 'collection_reference', 'collection_id', 'reference_id');
    }

    /** Partages de cette collection. */
    public function partages(): HasMany
    {
        return $this->hasMany(Partage::class, 'collection_id');
    }

    public function exports(): HasMany
    {
        return $this->hasMany(Export::class, 'collection_id');
    }
}
