const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport =  require('passport');
const mailchimp = require('@mailchimp/mailchimp_marketing');


mailchimp.setConfig({
  apiKey: '00be3c2ea4a1d3b37313d0e892f6529d6-us4',
  server: 'us4',
});

async function addUserToList(user_email, firstName, lastName) {
  try {
    const response = await mailchimp.lists.addListMember("043d9f8845", {
      email_address: user_email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
      },
    });

    console.log('User added to the audience list:', response);
  } catch (error) {
    console.error('Error adding user to the audience list:', error);
  }
}

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, country, password } = req.body;
    
    // Check if user with the same email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Hash password and create new user
    const saltRounds = 5;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user = new User({
      firstName,
      lastName,
      email,
      phone,
      country,
      password: hashedPassword
    });
    await user.save();

    try {
      addUserToList(email, firstName, lastName);
      console.log("add user success!!!")
    }
    catch {
      console.log("adding user failed!!!!")
    }

    res.json({ user, hashedPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.body });
  }
};

exports.login = async (req, res) => {
  try {
    const {  email, password } = req.body;
    console.log(req.body);
    // Check if user exists
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials---email' });
    }
    console.log(1)
    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch)
    if (!isMatch) {
      console.log('password')
      return res.status(401).json({ message: 'Invalid credentials---password' });
    }
    console.log(2)
    // Generate JWT token

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    console.log(3)
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.profileget = async (req, res) => {
  try {
    const userid = req.headers.userid;
    
    console.log(1)
    // Check if user exists
    const user = await User.findOne({ _id:userid });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials---email' });
    }
    
    // Check if password is correct
    
    res.json({user});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server logout' });
  }
};

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });



exports.googleAuthCallback = (req, res) => {
  res.redirect('/profile');
};