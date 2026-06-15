<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Table d'association N:N entre collection et reference.
     * La suppression d'une collection dissocie les références (sans les
     * supprimer) : seules les lignes de jointure sont effacées en cascade.
     */
    public function up(): void
    {
        Schema::create('collection_reference', function (Blueprint $table) {
            $table->foreignId('collection_id')->constrained('collection')->cascadeOnDelete();
            $table->foreignId('reference_id')->constrained('reference')->cascadeOnDelete();

            $table->primary(['collection_id', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_reference');
    }
};
