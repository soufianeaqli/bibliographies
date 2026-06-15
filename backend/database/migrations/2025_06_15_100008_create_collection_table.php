<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->timestamp('date_creation')->useCurrent();
            $table->foreignId('utilisateur_id')->constrained('utilisateur')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection');
    }
};
