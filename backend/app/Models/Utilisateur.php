<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Entité Utilisateur (étudiant / chercheur ou administrateur).
 *
 * @property int         $id
 * @property string      $nom
 * @property string      $email
 * @property string      $mot_de_passe
 * @property string      $role    utilisateur|administrateur
 * @property string      $statut  actif|inactif
 * @property \Illuminate\Support\Carbon $date_creation
 */
class Utilisateur extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UtilisateurFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'utilisateur';

    /** Le schéma utilise « date_creation » plutôt que les timestamps Laravel. */
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'email',
        'mot_de_passe',
        'role',
        'statut',
        'date_creation',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'datetime',
            'mot_de_passe' => 'hashed',
        ];
    }

    /* --- Adaptation de l'authentification à la colonne « mot_de_passe » --- */

    public function getAuthPassword(): string
    {
        return $this->mot_de_passe;
    }

    public function getAuthPasswordName(): string
    {
        return 'mot_de_passe';
    }

    /* --- Relations --- */

    /** Références possédées par l'utilisateur (1 → 0..*). */
    public function references(): HasMany
    {
        return $this->hasMany(Reference::class, 'utilisateur_id');
    }

    /** Collections créées par l'utilisateur (1 → 0..*). */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class, 'utilisateur_id');
    }

    /** Sessions ouvertes par l'utilisateur (1 → 0..*). */
    public function sessions(): HasMany
    {
        return $this->hasMany(Session::class, 'utilisateur_id');
    }

    /** Exports générés par l'utilisateur (1 → 0..*). */
    public function exports(): HasMany
    {
        return $this->hasMany(Export::class, 'utilisateur_id');
    }

    /** Partages envoyés (l'utilisateur est l'expéditeur). */
    public function partagesEnvoyes(): HasMany
    {
        return $this->hasMany(Partage::class, 'expediteur_id');
    }

    /** Favoris de l'utilisateur (1 → 0..*). */
    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class, 'utilisateur_id');
    }

    /** Références favorites (N:N via favori). */
    public function favorisReferences(): BelongsToMany
    {
        return $this->belongsToMany(Reference::class, 'favori', 'utilisateur_id', 'reference_id');
    }

    /** Partages reçus (l'utilisateur est le destinataire). */
    public function partagesRecus(): HasMany
    {
        return $this->hasMany(Partage::class, 'destinataire_id');
    }

    /* --- Helpers --- */

    public function estAdministrateur(): bool
    {
        return $this->role === 'administrateur';
    }

    public function estActif(): bool
    {
        return $this->statut === 'actif';
    }
}
