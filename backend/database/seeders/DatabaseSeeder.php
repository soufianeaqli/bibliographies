<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Données de démonstration (à décommenter au besoin) :
        //
        // Utilisateur::factory()->administrateur()->create([
        //     'nom' => 'Administrateur',
        //     'email' => 'admin@pt16.local',
        // ]);
        //
        // Utilisateur::factory(5)->create();
    }
}
