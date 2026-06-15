<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sous-type Thèse (hérite de Reference, même clé primaire `id`).
 *
 * @property int         $id
 * @property string|null $universite
 * @property string|null $type_these  master|doctorat
 */
class These extends Model
{
    protected $table = 'these';

    public $timestamps = false;

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'universite',
        'type_these',
    ];

    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class, 'id', 'id');
    }
}
