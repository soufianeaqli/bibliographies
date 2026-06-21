<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE reservation MODIFY COLUMN status ENUM('pending', 'approved', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE reservation MODIFY COLUMN status ENUM('pending', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'pending'");
    }
};
