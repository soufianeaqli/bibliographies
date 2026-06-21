<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reference', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('pdf_path')->nullable();
            $table->string('epub_path')->nullable();
            $table->string('audio_path')->nullable();
            $table->string('video_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_pages')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('reference', function (Blueprint $table) {
            $table->dropColumn([
                'description', 'cover_image', 'pdf_path', 'epub_path', 'audio_path', 
                'video_url', 'is_featured', 'is_archived', 'rating', 'total_pages'
            ]);
        });
    }
};
