<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    protected $table = 'avis';

    protected $fillable = [
        'utilisateur_id',
        'reference_id',
        'rating',
        'comment',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function reference()
    {
        return $this->belongsTo(Reference::class, 'reference_id');
    }
}
