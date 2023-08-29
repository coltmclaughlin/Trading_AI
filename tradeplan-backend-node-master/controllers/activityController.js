const Activity = require('../models/Activity');
const User = require('../models/User');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        const uniquePrefix = Date.now() + '---';
        cb(null, uniquePrefix + file.originalname); // Set unique file name
    }
});

// Create multer instance
const upload = multer({ storage: storage });

exports.getactivity = async (req, res) => {
    try {
        console.log('getactivity: here')
        const alldata = await Activity.find();
        console.log("getactivity: ", alldata)
        res.send(alldata);
    } catch (err) {
        console.log(err);
    }
}

exports.gethistory = async (req, res) => {
    try {
        const userid = req.headers.userid;
        console.log('gethistory:', userid)
        const data = await Activity.find({ name_id: userid });
        res.send(data);
    } catch (err) {
        console.log(err);
    }
}


exports.updatelike = async (req, res) => {
    userId = req.params.userId;
    activeId = req.params.activeId;
    try {
        if (req.params.flag === 'true') {
            console.log('like: ', userId, activeId);
            Activity.findByIdAndUpdate(activeId, { $push: { agree: userId } }, { new: true }).then(updatedDocument => {
                console.log(updatedDocument);
            })
                .catch(error => {
                    console.error(error);
                });
        } else {
            console.log('unlike: ', userId, activeId);
            Activity.findByIdAndUpdate(activeId, { $push: { disagree: userId } }, { new: true }).then(updatedDocument => {
                console.log(updatedDocument);
            })
                .catch(error => {
                    console.error(error);
                });
        }

    } catch (err) {
        res.send('fail')
        console.log(err);
    }
}



