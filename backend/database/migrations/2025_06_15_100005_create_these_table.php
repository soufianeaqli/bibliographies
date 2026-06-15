<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('these', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('universite')->nullable();
            $table->enum('type_these', ['master', 'doctorat'])->nullable();

            $table->foreign('id')->references('id')->on('reference')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('these');
    }
};
