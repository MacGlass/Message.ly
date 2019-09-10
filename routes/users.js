const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { SECRET_KEY } = require("../config")
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
    return res.json({messages: messagesFromDB})
  } catch (err) {
    return next(err);
  }
});

module.exports = router;