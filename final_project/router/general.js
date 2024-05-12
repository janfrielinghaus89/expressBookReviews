const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // Extrahiere Benutzernamen und Passwort aus dem Anforderungskörper
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (users[username]) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    users[username] = password;
  
    return res.status(200).json({ message: "Registration successful" });
  });

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Send the list of books as JSON response with pretty formatting
    const formattedBooks = JSON.stringify(books, null, 2); // 2 spaces indentation for better readability
    res.status(200).send(formattedBooks);
  });
  

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extrahiere ISBN aus den Anforderungsparametern
  
    // Überprüfe, ob das Buch mit der angegebenen ISBN existiert
    if (books[isbn]) {
      // Wenn das Buch existiert, sende seine Details als JSON-Antwort
      res.status(200).json(books[isbn]);
    } else {
      // Wenn das Buch nicht gefunden wird, sende eine 404 (Not Found) Antwort
      res.status(404).json({ message: "Book not found" });
    }
  });  
  
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
  
    const authorBooks = [];
  
    for (const isbn in books) {
      if (books.hasOwnProperty(isbn)) {
        const book = books[isbn];
        if (book.author === author) {
          authorBooks.push(book);
        }
      }
    }
  
    if (authorBooks.length > 0) {
      res.status(200).json(authorBooks);
    } else {
      res.status(404).json({ message: "No books found for the author" });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
  
    const titleBooks = [];
  
    for (const isbn in books) {
      if (books.hasOwnProperty(isbn)) {
        const book = books[isbn];
        if (book.title === title) {
          titleBooks.push(book);
        }
      }
    }
  
    if (titleBooks.length > 0) {
      res.status(200).json(titleBooks);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  });


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    if (books[isbn].reviews && Object.keys(books[isbn].reviews).length > 0) {
      res.status(200).json(books[isbn].reviews);
    } else {
      res.status(404).json({ message: "No reviews found for the book" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});


module.exports.general = public_users;
