const express = require("express");
const User = require("../models/user");
const ExpressError = require("../expressError")
const router = express.Router();
const { SECRET_KEY } = require("../config")
const jwt = require("jsonwebtoken");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    if (await User.get(username)) {
      if (await User.authenticate(username, password)) {
        console.log("This is the req.body", req.body)
        payload = { username }
        let token = jwt.sign(payload, SECRET_KEY)
        return res.json({ token })
      } else {
        throw new ExpressError("Invalid username or password", 400)
      } 
    }
    else {
      throw new ExpressError("Invalid username or password", 400)
    }
  } catch (err) {
    return next(err)
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function (req, res, next) {
  try {
    const {
      username,
      password,
      first_name,
      last_name,
      phone
    } = req.body;

    let userData = await User.register({ username, password, first_name, last_name, phone })

    payload = { username: userData.username }
    let token = jwt.sign(payload, SECRET_KEY)
    return res.json({ token })

  } catch (err) {
    return next(err)
  }
});


module.exports = router;