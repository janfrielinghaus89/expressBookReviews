const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Import axios module
const books = require("./booksdb.js");
const regd_users = express.Router();
const public_users = express.Router();

let users = [];

const isValid = (username) => {
    return username.length >= 5;
}
  
const authenticatedUser = (username, password) => {
    const hardcodedUsername = "jf89";
    const hardcodedPassword = "test";

    return (username === hardcodedUsername && password === hardcodedPassword);
}
  

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (authenticatedUser(username, password)) {
      const accessToken = jwt.sign({ username: username }, "secret_key");
  
      return res.status(200).json({ accessToken: accessToken });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  });  

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.username;
    const isbn = req.params.isbn;
    const review = req.query.review;
  
    if (!username) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      }
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully" });
    }
  });

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.username;
    const isbn = req.params.isbn;

    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found" });
    }
});


const baseURL = 'https://steamjan-5001.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai'; // Replace with your base URL

const fetchBooks = () => {
    return new Promise((resolve, reject) => {
        axios.get(`${baseURL}/books`) 
            .then(response => {
                resolve(response.data); 
            })
            .catch(error => {
                console.error('Error fetching books:', error); // Log error to console
                reject(error);
            });
    });
};

// Get the book list available in the shop using Promise callbacks
public_users.get('/', async (req, res) => { // Use async keyword here
    try {
        // Call the fetchBooks function to fetch the list of books
        const books = await fetchBooks();
        // Send the list of books as JSON response with pretty formatting
        const formattedBooks = JSON.stringify(books, null, 2); // 2 spaces indentation for better readability
        res.status(200).send(formattedBooks);
    } catch (error) {
        console.error('Error fetching books:', error); // Log error to console
        res.status(500).json({ message: 'Internal server error' });
    }
});

const fetchBookDetails = (isbn) => {
    return new Promise((resolve, reject) => {
        axios.get(`${baseURL}/books/${isbn}`)
            .then(response => {
                resolve(response.data); // Resolve the Promise with the data received from the API
            })
            .catch(error => {
                reject(error); // Reject the Promise with the error received from the API
            });
    });
};

public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        // Call the fetchBookDetails function to fetch book details based on ISBN
        const bookDetails = await fetchBookDetails(isbn);
        // Send the book details as JSON response
        res.status(200).json(bookDetails);
    } catch (error) {
        // Handle any errors that occurred during fetching book details
        console.error('Error fetching book details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const fetchBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        axios.get(`${baseURL}/books?author=${author}`)
            .then(response => {
                resolve(response.data); // Resolve the Promise with the data received from the API
            })
            .catch(error => {
                reject(error); // Reject the Promise with the error received from the API
            });
    });
};

public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        // Call the fetchBooksByAuthor function to fetch book details based on the author
        const booksByAuthor = await fetchBooksByAuthor(author);
        // Send the book details as JSON response
        res.status(200).json(booksByAuthor);
    } catch (error) {
        // Handle any errors that occurred during fetching book details
        console.error('Error fetching book details by author:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const fetchBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        axios.get(`${baseURL}/books?title=${title}`)
            .then(response => {
                resolve(response.data); // Resolve the Promise with the data received from the API
            })
            .catch(error => {
                reject(error); // Reject the Promise with the error received from the API
            });
    });
};

public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        // Call the fetchBooksByTitle function to fetch book details based on the title
        const booksByTitle = await fetchBooksByTitle(title);
        // Send the book details as JSON response
        res.status(200).json(booksByTitle);
    } catch (error) {
        // Handle any errors that occurred during fetching book details
        console.error('Error fetching book details by title:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports.general = public_users;
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;