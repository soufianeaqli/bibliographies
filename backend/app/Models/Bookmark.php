<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bookmark extends Model
{
    protected $table = 'bookmark';

    protected $fillable = [
        'utilisateur_id',
        'reference_id',
        'page_number',
        'note',
        'page_text',
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
