const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});


public_users.get('/', function (req, res) {
    axios.get('http://localhost:5000/books')
        .then(response => {
            res.send(JSON.stringify(response.data, null, 4));
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching book list", error: error.message });
        });
});

// Get book details based on ISBN
public_users.get('/books', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/books');
        res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        console.error("Error fetching book list:", error.message);
        res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const book = Object.values(books).find(b => b.author === author);
  res.send(book);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
    const title = req.params.title;
    const book = Object.values(books).find(b => b.title === title);
    res.send(book);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = Object.values(books).find(b => b.isbn === isbn);
  if (book && book.reviews) {
    res.send(JSON.stringify(book.reviews, null, 4));
    } else {
    res.status(404).send(`No reviews found for ISBN ${isbn}`);
    }
});


module.exports.general = public_users;
