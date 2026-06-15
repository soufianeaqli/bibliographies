<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sous-type Site web (hérite de Reference, même clé primaire `id`).
 *
 * @property int                             $id
 * @property string|null                     $url
 * @property \Illuminate\Support\Carbon|null  $date_consultation
 */
class SiteWeb extends Model
{
    protected $table = 'site_web';

    public $timestamps = false;

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'url',
        'date_consultation',
    ];

    protected function casts(): array
    {
        return [
            'date_consultation' => 'date',
        ];
    }

    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class, 'id', 'id');
    }
}
