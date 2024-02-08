// app.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { userModel, UrlModel } = require('./Model/users');
const port = process.env.PORT || 8000;

// Now you can use UrlModel to interact with your URL data in the database

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

const CONNECTION_STRING = 'mongodb+srv://admin:admin@cluster0.hkttxzx.mongodb.net/UrlCollection?retryWrites=true&w=majority';
const DATABASE_NAME = 'UrlCollection';

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB successfully');
        app.listen(port, () => {
            console.log('Server is running on port 5013');
        });
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
    });

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    userModel.create({ email, password })
        .then(user => res.json(user))
        .catch(err => res.json(err));
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    userModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json({ status: "Success", userId: user._id }); // Return user ID along with success message
                }
                else {
                    res.json("Password is wrong");
                }
            } else {
                res.json("No Registered");
            }
        })
})

// Add a new route to save URL data
app.post('/shorten-url', (req, res) => {
    const { userId, originalUrl, shortUrl } = req.body;
    userModel.findByIdAndUpdate(userId, { $push: { urls: { originalUrl, shortUrl } } }, { new: true })
        .then(user => res.json(user))
        .catch(err => res.json({ error: err.message }));
});


app.get('/:shortUrl', (req, res) => {
    const shortUrl = req.params.shortUrl;
    UrlModel.findOne({ shortUrl }) // Find the URL in the database
        .then(url => {
            if (url) {
                res.redirect(url.originalUrl); // Redirect to the original URL
            } else {
                res.status(404).send('Short URL not found'); // Handle case where short URL is not found
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error'); // Handle any internal server errors
        });
});
// Add a new route to retrieve URL data for a specific user
app.get('/urls/:userId', (req, res) => {
    const userId = req.params.userId;
    userModel.findById(userId)
        .then(user => {
            if (user) {
                console.log(user.urls)
                res.json(user.urls);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});
// Add a new route to save the original and short URL in the database
app.post('/save-url', (req, res) => {
    const { userId, originalUrl, shortUrl } = req.body;
    const newUrl = new UrlModel({ userId, originalUrl, shortUrl });
    newUrl.save()
      .then(url => res.json(url))
      .catch(err => res.json({ error: err.message }));
  });
  