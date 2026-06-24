<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $table = 'contact';

    protected $fillable = [
        'utilisateur_id',
        'sujet',
        'message',
        'type',
        'is_read',
        'reponse',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
        ];
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
