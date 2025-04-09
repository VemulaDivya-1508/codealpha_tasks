document.addEventListener('DOMContentLoaded', () => {
    const addBookForm = document.getElementById('add-book-form');
    const bookList = document.getElementById('books');
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const historyList = document.getElementById('history-list');

    let books = loadBooks();
    let borrowingHistory = loadHistory();
    let categories = getCategories(books);

    renderBooks(books);
    renderCategories(categories);
    renderHistory(borrowingHistory);

    addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const isbn = document.getElementById('isbn').value.trim();
        const category = document.getElementById('category').value.trim();

        if (title && author) {
            const newBook = {
                id: Date.now(),
                title,
                author,
                isbn,
                category,
                isBorrowed: false
            };
            books.push(newBook);
            saveBooks();
            renderBooks(books);
            updateCategories();
            addBookForm.reset();
        } else {
            alert('Title and Author are required.');
        }
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.isbn.toLowerCase().includes(searchTerm)
        );
        renderBooks(filteredBooks);
    });

    filterCategory.addEventListener('change', () => {
        const selectedCategory = filterCategory.value;
        const filteredBooks = selectedCategory
            ? books.filter(book => book.category === selectedCategory)
            : books;
        renderBooks(filteredBooks);
    });

    function renderBooks(bookArray) {
        bookList.innerHTML = '';
        bookArray.forEach(book => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="book-details">
                    <strong>${book.title}</strong> by ${book.author}
                    ${book.isbn ? `<br>ISBN: ${book.isbn}` : ''}
                    ${book.category ? `<br>Category: ${book.category}` : ''}
                    <br>Status: ${book.isBorrowed ? 'Borrowed' : 'Available'}
                </div>
                <div class="book-actions">
                    ${book.isBorrowed
                        ? `<button class="borrowed" data-id="${book.id}" onclick="returnBook(${book.id})">Return</button>`
                        : `<button data-id="${book.id}" onclick="borrowBook(${book.id})">Borrow</button>`}
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </div>
            `;
            bookList.appendChild(listItem);
        });
    }

    window.borrowBook = (bookId) => {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1 && !books[bookIndex].isBorrowed) {
            books[bookIndex].isBorrowed = true;
            borrowingHistory.push({
                bookId: bookId,
                title: books[bookIndex].title,
                borrowedDate: new Date().toLocaleString(),
                returnedDate: null
            });
            saveBooks();
            saveHistory();
            renderBooks(books);
            renderHistory(borrowingHistory);
        }
    };

    window.returnBook = (bookId) => {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1 && books[bookIndex].isBorrowed) {
            books[bookIndex].isBorrowed = false;
            const historyIndex = borrowingHistory.findIndex(item => item.bookId === bookId && !item.returnedDate);
            if (historyIndex !== -1) {
                borrowingHistory[historyIndex].returnedDate = new Date().toLocaleString();
                saveHistory();
            }
            saveBooks();
            renderBooks(books);
            renderHistory(borrowingHistory);
        }
    };

    window.deleteBook = (bookId) => {
        books = books.filter(book => book.id !== bookId);
        borrowingHistory = borrowingHistory.filter(item => item.bookId !== bookId);
        saveBooks();
        saveHistory();
        renderBooks(books);
        renderHistory(borrowingHistory);
        updateCategories();
    };

    function loadBooks() {
        const storedBooks = localStorage.getItem('books');
        return storedBooks ? JSON.parse(storedBooks) : [];
    }

    function saveBooks() {
        localStorage.setItem('books', JSON.stringify(books));
    }

    function loadHistory() {
        const storedHistory = localStorage.getItem('borrowingHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }

    function saveHistory() {
        localStorage.setItem('borrowingHistory', JSON.stringify(borrowingHistory));
    }

    function getCategories(bookArray) {
        const uniqueCategories = [...new Set(bookArray.map(book => book.category).filter(Boolean))];
        return uniqueCategories;
    }

    function renderCategories(categoryArray) {
        filterCategory.innerHTML = '<option value="">All Categories</option>';
        categoryArray.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategory.appendChild(option);
        });
    }

    function updateCategories() {
        categories = getCategories(books);
        renderCategories(categories);
    }

    function renderHistory(historyArray) {
        historyList.innerHTML = '';
        historyArray.forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add('history-item');
            listItem.textContent = `Book: "${item.title}" borrowed on ${item.borrowedDate} ${item.returnedDate ? `returned on ${item.returnedDate}` : ' (Not returned)'}`;
            historyList.appendChild(listItem);
        });
    }
});