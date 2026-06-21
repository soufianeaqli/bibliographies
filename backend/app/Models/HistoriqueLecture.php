<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoriqueLecture extends Model
{
    protected $table = 'historique_lecture';

    protected $fillable = [
        'utilisateur_id',
        'reference_id',
        'last_page_read',
        'progress_percentage',
        'notes',
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
