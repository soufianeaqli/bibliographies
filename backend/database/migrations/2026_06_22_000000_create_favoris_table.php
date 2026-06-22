<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favori', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utilisateur_id')->constrained('utilisateur', 'id')->onDelete('cascade');
            $table->foreignId('reference_id')->constrained('reference', 'id')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['utilisateur_id', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favori');
    }
};
