<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Un export concerne soit une référence, soit une collection ; les deux
     * clés étrangères sont donc nullables et mises à NULL si la source est
     * supprimée (l'historique d'export est conservé).
     */
    public function up(): void
    {
        Schema::create('export', function (Blueprint $table) {
            $table->id();
            $table->enum('format', ['apa', 'ieee', 'bibtex']);
            $table->longText('contenu');
            $table->timestamp('date_export')->useCurrent();
            $table->foreignId('utilisateur_id')->constrained('utilisateur')->cascadeOnDelete();
            $table->foreignId('reference_id')->nullable()->constrained('reference')->nullOnDelete();
            $table->foreignId('collection_id')->nullable()->constrained('collection')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('export');
    }
};
