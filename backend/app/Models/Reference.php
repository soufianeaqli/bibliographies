<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Entité Reference (classe « abstraite » du diagramme de classes).
 *
 * L'héritage est implémenté en « Table Per Subclass » : la table `reference`
 * porte les attributs communs et un discriminant `type`, tandis que chaque
 * sous-type (article, livre, these, site_web, rapport) possède sa propre table
 * partageant la même clé primaire `id`.
 *
 * @property int    $id
 * @property string $titre
 * @property string $auteur
 * @property int    $annee
 * @property string $type
 * @property int    $utilisateur_id
 */
class Reference extends Model
{
    protected $table = 'reference';

    public $timestamps = false;

    /** Types de référence supportés (discriminant `type`). */
    public const TYPES = ['article', 'livre', 'these', 'site_web', 'rapport'];

    protected $fillable = [
        'titre',
        'auteur',
        'annee',
        'type',
        'date_creation',
        'utilisateur_id',
        'description',
        'cover_image',
        'pdf_path',
        'epub_path',
        'audio_path',
        'video_url',
        'is_featured',
        'is_archived',
        'rating',
        'total_pages',
    ];

    protected function casts(): array
    {
        return [
            'annee' => 'integer',
            'date_creation' => 'datetime',
        ];
    }

    /* --- Relations principales --- */

    /** Propriétaire de la référence. */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    /** Avis / notes laissés par les utilisateurs. */
    public function avis(): HasMany
    {
        return $this->hasMany(Avis::class, 'reference_id');
    }

    /** Tags associés (N:N via reference_tag). */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'reference_tag', 'reference_id', 'tag_id');
    }

    /** Collections contenant la référence (N:N via collection_reference). */
    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class, 'collection_reference', 'reference_id', 'collection_id');
    }

    /** Exports générés à partir de cette référence. */
    public function exports(): HasMany
    {
        return $this->hasMany(Export::class, 'reference_id');
    }

    /* --- Sous-types (héritage TPS : même id que la référence) --- */

    public function article(): HasOne
    {
        return $this->hasOne(Article::class, 'id', 'id');
    }

    public function livre(): HasOne
    {
        return $this->hasOne(Livre::class, 'id', 'id');
    }

    public function these(): HasOne
    {
        return $this->hasOne(These::class, 'id', 'id');
    }

    public function siteWeb(): HasOne
    {
        return $this->hasOne(SiteWeb::class, 'id', 'id');
    }

    public function rapport(): HasOne
    {
        return $this->hasOne(Rapport::class, 'id', 'id');
    }

    /**
     * Retourne le modèle de sous-type correspondant au `type` courant.
     */
    public function details(): ?Model
    {
        return match ($this->type) {
            'article' => $this->article,
            'livre' => $this->livre,
            'these' => $this->these,
            'site_web' => $this->siteWeb,
            'rapport' => $this->rapport,
            default => null,
        };
    }
}
