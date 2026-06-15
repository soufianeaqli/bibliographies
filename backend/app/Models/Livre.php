<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sous-type Livre (hérite de Reference, même clé primaire `id`).
 *
 * @property int         $id
 * @property string|null $editeur
 * @property string|null $ville
 * @property string|null $isbn
 */
class Livre extends Model
{
    protected $table = 'livre';

    public $timestamps = false;

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'editeur',
        'ville',
        'isbn',
    ];

    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class, 'id', 'id');
    }
}
