<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SocialiteController;
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

/* --- Google OAuth (routes publiques) --- */
Route::get('/auth/google/redirect', [SocialiteController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialiteController::class, 'handleGoogleCallback']);

use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BookDetailController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ChatbotController;

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

    // Tous mes marque-pages (pour la page Notes)
    Route::get('/bookmarks/mine', [BookDetailController::class, 'getMyBookmarks']);

    // Avis / Commentaires
    Route::get('/books/{id}/avis', [BookDetailController::class, 'getAvis']);
    Route::post('/books/{id}/avis', [BookDetailController::class, 'addAvis']);

    // Catégories / Genres
    Route::get('/categories', [BookDetailController::class, 'getCategories']);
    Route::get('/history', [BookDetailController::class, 'getHistory']);
    Route::get('/favoris', [BookDetailController::class, 'getFavoris']);
    Route::get('/books/{id}/is-favori', [BookDetailController::class, 'isFavori']);
    Route::post('/books/{id}/favori', [BookDetailController::class, 'addFavori']);
    Route::delete('/books/{id}/favori', [BookDetailController::class, 'removeFavori']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Recherche et import depuis API externe (accessible à tout utilisateur connecté)
    Route::post('/books/search-api', [BookController::class, 'searchExternalApi']);
    Route::post('/books/fetch-from-url', [BookController::class, 'fetchFromUrl']);
    Route::post('/books/import-selected', [BookController::class, 'importSelected']);

    // Contact / Messagerie
    Route::post('/contacts', [ContactController::class, 'store']);
    Route::get('/contacts/mine', [ContactController::class, 'mine']);

    // Chatbot
    Route::post('/chat', [ChatbotController::class, 'ask']);

    // Admin : import massif, gestion des réservations, messagerie
    Route::middleware('admin')->group(function () {
        Route::post('/books/import-100', [BookController::class, 'importBooks100']);
        Route::get('/admin/reservations/pending', [AdminController::class, 'pendingReservations']);
        Route::post('/admin/reservations/{id}/approve', [AdminController::class, 'approve']);
        Route::post('/admin/reservations/{id}/reject', [AdminController::class, 'reject']);
        Route::get('/admin/contacts', [ContactController::class, 'index']);
        Route::get('/admin/contacts/{contact}', [ContactController::class, 'show']);
        Route::patch('/admin/contacts/{contact}/read', [ContactController::class, 'markAsRead']);
        Route::post('/admin/contacts/{contact}/reply', [ContactController::class, 'reply']);
        Route::delete('/admin/contacts/{contact}', [ContactController::class, 'destroy']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::get('/admin/users/{utilisateur}', [AdminController::class, 'userDetail']);
        Route::patch('/admin/users/{utilisateur}/toggle-block', [AdminController::class, 'toggleBlock']);
        Route::patch('/admin/users/{utilisateur}/role', [AdminController::class, 'updateRole']);
        Route::delete('/admin/users/{utilisateur}', [AdminController::class, 'destroyUser']);
    });
});
