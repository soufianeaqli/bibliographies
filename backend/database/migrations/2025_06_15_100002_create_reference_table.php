<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reference', function (Blueprint $table) {
            $table->id();
            $table->string('titre', 500);
            $table->string('auteur', 500);
            $table->integer('annee')->nullable();
            $table->enum('type', ['article', 'livre', 'these', 'site_web', 'rapport']);
            $table->timestamp('date_creation')->useCurrent();
            $table->foreignId('utilisateur_id')->constrained('utilisateur')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reference');
    }
};
