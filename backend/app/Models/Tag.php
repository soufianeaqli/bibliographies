<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Entité Tag : étiquette libre applicable à des références (ex. « IA »).
 *
 * @property int    $id
 * @property string $nom
 */
class Tag extends Model
{
    protected $table = 'tag';

    public $timestamps = false;

    protected $fillable = [
        'nom',
    ];

    /** Références étiquetées avec ce tag (N:N). */
    public function references(): BelongsToMany
    {
        return $this->belongsToMany(Reference::class, 'reference_tag', 'tag_id', 'reference_id');
    }
}
