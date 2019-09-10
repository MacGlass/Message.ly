const express = require("express");
const User = require("../models/user");
const authRoutes = require("../routes/auth");
const ExpressError = require("../expressError")
const router = express.Router();
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', auth.ensureLoggedIn, async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    jwt.verify(tokenFromBody, SECRET_KEY);
    let allUsers = await User.all();
    console.log("From users route----> ", allUsers)
    return res.json({users: allUsers})
  } catch (err) {
    return next(err);
  }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', auth.ensureLoggedIn, auth.ensureCorrectUser, async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const username = req.params.username;
    jwt.verify(tokenFromBody, SECRET_KEY);
    let userFromDB = await User.get(username);
    console.log("From get one user route----> ", userFromDB)
    return res.json({user: userFromDB})
  } catch (err) {
    return next(err);
  }
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', auth.ensureLoggedIn, auth.ensureCorrectUser, async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const username = req.params.username;
    jwt.verify(tokenFromBody, SECRET_KEY);
    let messagesFromDB = await User.messagesTo(username);
    console.log("From get messages to user route----> ", messagesFromDB)
    return res.json({messages: messagesFromDB})
  } catch (err) {
    return next(err);
  }
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', auth.ensureLoggedIn, auth.ensureCorrectUser, async function (req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const username = req.params.username;
    jwt.verify(tokenFromBody, SECRET_KEY);
    let messagesFromDB = await User.messagesFrom(username);
    console.log("From get messages to user route----> ", messagesFromDB)
    return res.json({messages: messagesFromDB})
  } catch (err) {
    return next(err);
  }
});

module.exports = router;