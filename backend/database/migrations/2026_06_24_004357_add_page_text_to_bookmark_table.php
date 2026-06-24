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
        Schema::table('bookmark', function (Blueprint $table) {
            $table->text('page_text')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('bookmark', function (Blueprint $table) {
            $table->dropColumn('page_text');
        });
    }
};
