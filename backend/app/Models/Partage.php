<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Association Partage : un utilisateur (expéditeur) partage une collection
 * avec un autre utilisateur (destinataire), en lecture seule par défaut.
 *
 * @property int    $id
 * @property string $permission  lecture|ecriture
 * @property int    $collection_id
 * @property int    $expediteur_id
 * @property int    $destinataire_id
 */
class Partage extends Model
{
    protected $table = 'partage';

    public $timestamps = false;

    protected $fillable = [
        'date_partage',
        'permission',
        'collection_id',
        'expediteur_id',
        'destinataire_id',
    ];

    protected function casts(): array
    {
        return [
            'date_partage' => 'datetime',
        ];
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class, 'collection_id');
    }

    public function expediteur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'expediteur_id');
    }

    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'destinataire_id');
    }
}
