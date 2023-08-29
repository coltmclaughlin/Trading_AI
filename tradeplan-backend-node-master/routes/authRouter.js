// server/routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const AuthController = require('../controllers/authController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '--' + file.originalname);
    },
});
const upload = multer({ storage: storage });

router.post('/profile', upload.single('avatar'), async (req, res) => {
    try {
        // let userdata;
        const data = req.body;
        // const { filename } = req.file;
        // data.avatar = filename;
        const saltRounds = 5;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        User.findByIdAndUpdate(data._id, { firstName: data.firstName, lastName:data.lastName, password: hashedPassword, country: data.country, avatar: data.avatar, email: data.email, phone: data.phone }).then(updatedDocument => {
            console.log(updatedDocument);
        })
        .catch(error => {
            console.error(error);
        });
        res.send('success');
    } catch (err) {
        res.send('fail')
    }
});

router.get('/auth/google', AuthController.googleAuth);
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), AuthController.googleAuthCallback);
router.post('/register', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);
router.get('/profile', AuthController.profileget);


module.exports = router;
