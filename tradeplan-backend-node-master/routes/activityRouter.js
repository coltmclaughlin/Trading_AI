const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activityController');
const Activity = require('../models/Activity');

const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '--' + file.originalname);
    },
});
const upload = multer({ storage: storage });

router.get('/getactivity', ActivityController.getactivity);
router.get('/gethistory', ActivityController.gethistory);
router.post('/addactivity', upload.single('image'), async (req, res) => {
    try {
        const data = req.body;
        const { filename } = req.file;
        data.image = filename;
        activity = new Activity(data);
        console.log(activity);
        await activity.save();
        res.send('success');
    } catch (err) {
        res.send('fail')
    }
});

router.get('/like/:flag/:userId/:activeId', ActivityController.updatelike);

module.exports = router;
