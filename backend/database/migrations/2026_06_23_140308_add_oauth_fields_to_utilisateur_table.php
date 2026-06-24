<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('utilisateur', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('statut');
            $table->string('provider_id')->nullable()->after('provider');
            $table->text('provider_token')->nullable()->after('provider_id');
            $table->string('avatar')->nullable()->after('provider_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('utilisateur', function (Blueprint $table) {
            $table->dropColumn(['provider', 'provider_id', 'provider_token', 'avatar']);
        });
    }
};
