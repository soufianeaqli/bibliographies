<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Utilisateur::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'nom' => 'Super Administrateur',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'administrateur',
                'statut' => 'actif',
                'date_creation' => Carbon::now(),
            ]
        );

        // Optionnel : On crée aussi un compte utilisateur normal pour faire les tests
        Utilisateur::updateOrCreate(
            ['email' => 'user@user.com'],
            [
                'nom' => 'Lecteur Premium',
                'mot_de_passe' => Hash::make('password'),
                'role' => 'utilisateur',
                'statut' => 'actif',
                'date_creation' => Carbon::now(),
            ]
        );
    }
}
