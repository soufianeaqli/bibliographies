<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_web', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('url', 2048)->nullable();
            $table->date('date_consultation')->nullable();

            $table->foreign('id')->references('id')->on('reference')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_web');
    }
};
