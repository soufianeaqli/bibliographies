<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session', function (Blueprint $table) {
            $table->id();
            $table->string('token')->unique();
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_expiration')->nullable();
            $table->foreignId('utilisateur_id')->constrained('utilisateur')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session');
    }
};
