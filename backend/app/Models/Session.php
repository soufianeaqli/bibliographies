<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Entité Session : jeton d'authentification d'un utilisateur, avec sa date
 * d'expiration.
 *
 * @property int                              $id
 * @property string                           $token
 * @property \Illuminate\Support\Carbon       $date_creation
 * @property \Illuminate\Support\Carbon|null  $date_expiration
 * @property int                              $utilisateur_id
 */
class Session extends Model
{
    protected $table = 'session';

    public $timestamps = false;

    protected $fillable = [
        'token',
        'date_creation',
        'date_expiration',
        'utilisateur_id',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'datetime',
            'date_expiration' => 'datetime',
        ];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    /** La session est valide tant qu'elle n'a pas expiré. */
    public function estValide(): bool
    {
        return $this->date_expiration === null || $this->date_expiration->isFuture();
    }

    /** Invalide la session en la faisant expirer immédiatement. */
    public function invalider(): void
    {
        $this->date_expiration = now();
        $this->save();
    }
}
