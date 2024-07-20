const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { id: 1, username: 'Amira', password: 'password1' },
    { id: 2, username: 'bob', password: 'password2' },
    { id: 3, username: 'charlie', password: 'password3' },
    { id: 4, username: 'david', password: 'password4' },
    { id: 5, username: 'emily', password: 'password5' },
    { id: 6, username: 'frank', password: 'password6' },
    { id: 7, username: 'grace', password: 'password7' },
    { id: 8, username: 'hank', password: 'password8' },
    { id: 9, username: 'isabelle', password: 'password9' },
    { id: 10, username: 'jason', password: 'password10' }
];

const isValid = (username) => {
    // Check if username is valid (e.g., length, allowed characters)
    return username && username.length > 0;
  }
  
const authenticatedUser = (username, password) => {
    // Check if the user exists and password matches
    const user = users.find(u => u.username === username);
    return user && user.password === password;
}
  
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});
  
  
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { username, review } = req.body;
    const { isbn } = req.params;
    
    if (!username || !review) {
        return res.status(400).json({ message: "Invalid input. Username and review are required." });
    }

    const book = Object.values(books).find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    const existingReview = book.reviews.find(r => r.username === username);
    if (existingReview) {
        existingReview.review = review;
    } else {
        book.reviews.push({ username, review });
    }

    res.status(200).json({ message: "Review added/modified successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { username } = req.session.authorization;
    const { isbn } = req.params;
    
    if (!username) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const book = Object.values(books).find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    const reviewIndex = book.reviews.findIndex(r => r.username === username);
    if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found" });
    }

    book.reviews.splice(reviewIndex, 1);
    res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
