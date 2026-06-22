<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes API
|--------------------------------------------------------------------------
|
| Toutes les routes sont automatiquement préfixées par « /api ».
|
*/

/* --- Module 1 : Authentification (routes publiques) --- */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BookDetailController;
use App\Http\Controllers\Api\AdminController;

/* --- Routes protégées (token Sanctum requis) --- */
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'update']);
    
    // Smart Library Books CRUD
    Route::post('/books/import', [BookController::class, 'importFromGoogle']);
    Route::get('/books', [BookController::class, 'index']);
    Route::post('/books', [BookController::class, 'store']);
    // Doit être avant /books/{id} pour ne pas être intercepté
    Route::delete('/books/delete-all', [BookController::class, 'destroyAll'])->middleware('admin');
    Route::delete('/books/{id}', [BookController::class, 'destroy']);

    // Détail et lecture des livres
    Route::get('/books/{id}', [BookDetailController::class, 'show']);
    Route::post('/books/{id}/reserve', [BookDetailController::class, 'reserve']);
    Route::post('/books/{id}/cancel-reservation', [BookDetailController::class, 'cancelReservation']);
    Route::get('/reservations/mine', [BookDetailController::class, 'getMyReservations']);

    // Pages Google Books
    Route::get('/books/{id}/pages', [BookDetailController::class, 'getPages']);

    // Progression de lecture
    Route::get('/books/{id}/reading-progress', [BookDetailController::class, 'getReadingProgress']);
    Route::post('/books/{id}/reading-progress', [BookDetailController::class, 'updateReadingProgress']);

    // Marque-pages
    Route::get('/books/{id}/bookmarks', [BookDetailController::class, 'getBookmarks']);
    Route::post('/books/{id}/bookmarks', [BookDetailController::class, 'addBookmark']);
    Route::delete('/bookmarks/{id}', [BookDetailController::class, 'deleteBookmark']);

    // Notes personnelles
    Route::get('/books/{id}/notes', [BookDetailController::class, 'getNotes']);
    Route::post('/books/{id}/notes', [BookDetailController::class, 'addNote']);
    Route::delete('/books/{id}/notes/{noteId}', [BookDetailController::class, 'deleteNote']);

    // Avis / Commentaires
    Route::get('/books/{id}/avis', [BookDetailController::class, 'getAvis']);
    Route::post('/books/{id}/avis', [BookDetailController::class, 'addAvis']);

    // Admin : import massif, gestion des réservations
    Route::middleware('admin')->group(function () {
        Route::post('/books/import-100', [BookController::class, 'importBooks100']);
        Route::get('/admin/reservations/pending', [AdminController::class, 'pendingReservations']);
        Route::post('/admin/reservations/{id}/approve', [AdminController::class, 'approve']);
        Route::post('/admin/reservations/{id}/reject', [AdminController::class, 'reject']);
    });
});
