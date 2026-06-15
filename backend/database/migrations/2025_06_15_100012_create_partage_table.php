<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partage', function (Blueprint $table) {
            $table->id();
            $table->timestamp('date_partage')->useCurrent();
            $table->enum('permission', ['lecture', 'ecriture'])->default('lecture');
            $table->foreignId('collection_id')->constrained('collection')->cascadeOnDelete();
            $table->foreignId('expediteur_id')->constrained('utilisateur')->cascadeOnDelete();
            $table->foreignId('destinataire_id')->constrained('utilisateur')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partage');
    }
};
