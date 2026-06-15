<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sous-type d'héritage (Table Per Subclass) : la clé primaire `id` est
     * aussi une clé étrangère vers reference(id).
     */
    public function up(): void
    {
        Schema::create('article', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('revue')->nullable();
            $table->string('volume')->nullable();
            $table->string('numero')->nullable();
            $table->string('pages')->nullable();
            $table->string('doi')->nullable();

            $table->foreign('id')->references('id')->on('reference')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article');
    }
};
