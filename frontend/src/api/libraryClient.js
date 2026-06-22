import client from './client';

export const fetchBooks = async () => {
    const { data } = await client.get('/books');
    return data;
};

export const createBook = async (formData) => {
    const { data } = await client.post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const deleteBook = async (id) => {
    const { data } = await client.delete(`/books/${id}`);
    return data;
};

export const importBooksFromGoogle = async () => {
    const { data } = await client.post('/books/import');
    return data;
};

// Book detail & reading
export const fetchBook = async (id) => {
    const { data } = await client.get(`/books/${id}`);
    return data;
};

export const reserveBook = async (id) => {
    const { data } = await client.post(`/books/${id}/reserve`);
    return data;
};

export const cancelReservation = async (id) => {
    const { data } = await client.post(`/books/${id}/cancel-reservation`);
    return data;
};

export const getMyReservations = async () => {
    const { data } = await client.get('/reservations/mine');
    return data;
};

// Reading progress
export const getReadingProgress = async (id) => {
    const { data } = await client.get(`/books/${id}/reading-progress`);
    return data;
};

export const updateReadingProgress = async (id, payload) => {
    const { data } = await client.post(`/books/${id}/reading-progress`, payload);
    return data;
};

// Bookmarks
export const getBookmarks = async (id) => {
    const { data } = await client.get(`/books/${id}/bookmarks`);
    return data;
};

export const addBookmark = async (id, payload) => {
    const { data } = await client.post(`/books/${id}/bookmarks`, payload);
    return data;
};

export const deleteBookmark = async (bookmarkId) => {
    const { data } = await client.delete(`/bookmarks/${bookmarkId}`);
    return data;
};

// Notes personnelles
export const getNotes = async (id) => {
    const { data } = await client.get(`/books/${id}/notes`);
    return data;
};

export const addNote = async (id, payload) => {
    const { data } = await client.post(`/books/${id}/notes`, payload);
    return data;
};

export const deleteNote = async (id, noteId) => {
    const { data } = await client.delete(`/books/${id}/notes/${noteId}`);
    return data;
};

// Avis
export const getAvis = async (id) => {
    const { data } = await client.get(`/books/${id}/avis`);
    return data;
};

export const addAvis = async (id, payload) => {
    const { data } = await client.post(`/books/${id}/avis`, payload);
    return data;
};

export const importBooks100 = async () => {
    const { data } = await client.post('/books/import-100');
    return data;
};

export const getBookPages = async (id) => {
    const { data } = await client.get(`/books/${id}/pages`);
    return data;
};

export const deleteAllBooks = async () => {
    const { data } = await client.delete('/books/delete-all');
    return data;
};

// Admin - Gestion des réservations
export const getPendingReservations = async () => {
    const { data } = await client.get('/admin/reservations/pending');
    return data;
};

export const approveReservation = async (id) => {
    const { data } = await client.post(`/admin/reservations/${id}/approve`);
    return data;
};

export const rejectReservation = async (id) => {
    const { data } = await client.post(`/admin/reservations/${id}/reject`);
    return data;
};

// Favoris
export const getFavoris = async () => {
    const { data } = await client.get('/favoris');
    return data;
};

export const isFavori = async (id) => {
    const { data } = await client.get(`/books/${id}/is-favori`);
    return data;
};

export const addFavori = async (id) => {
    const { data } = await client.post(`/books/${id}/favori`);
    return data;
};

export const removeFavori = async (id) => {
    const { data } = await client.delete(`/books/${id}/favori`);
    return data;
};

// Notifications
export const getNotifications = async () => {
    const { data } = await client.get('/notifications');
    return data;
};

export const getUnreadNotificationCount = async () => {
    const { data } = await client.get('/notifications/unread-count');
    return data;
};

export const markNotificationRead = async (id) => {
    const { data } = await client.patch(`/notifications/${id}/read`);
    return data;
};

export const markAllNotificationsRead = async () => {
    const { data } = await client.patch('/notifications/read-all');
    return data;
};
