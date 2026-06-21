import client from './client';

/**
 * Service to fetch books from backend
 */
export const fetchBooks = async () => {
    const { data } = await client.get('/books');
    return data;
};

/**
 * Service to upload a new book
 * @param {FormData} formData
 */
export const createBook = async (formData) => {
    const { data } = await client.post('/books', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
};

/**
 * Service to delete a book
 * @param {number|string} id
 */
export const deleteBook = async (id) => {
    const { data } = await client.delete(`/books/${id}`);
    return data;
};

/**
 * Service to ask backend to import books from Google
 */
export const importBooksFromGoogle = async () => {
    const { data } = await client.post('/books/import');
    return data;
};
