<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sous-type Rapport (hérite de Reference, même clé primaire `id`).
 *
 * @property int         $id
 * @property string|null $organisation
 */
class Rapport extends Model
{
    protected $table = 'rapport';

    public $timestamps = false;

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'organisation',
    ];

    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class, 'id', 'id');
    }
}
