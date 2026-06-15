<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livre', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('editeur')->nullable();
            $table->string('ville')->nullable();
            $table->string('isbn')->nullable();

            $table->foreign('id')->references('id')->on('reference')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livre');
    }
};
