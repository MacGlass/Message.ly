const express = require("express");
const User = require("../models/user");
const ExpressError = require("../expressError")
const router = express.Router();
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    if (await User.authenticate(username, password)) {
      console.log(username)
      payload = {username}
      let token = jwt.sign(payload, SECRET_KEY)
      return res.json(token)
    } else {
      throw new ExpressError("Invalid username or password", 401)
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

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    let userData = await User.register({ username, password: hashedPassword, first_name, last_name, phone })

    // return res.json(userData)
    res.redirect("/login", userData)

  } catch (err) {
    return next(err)
  }
});


module.exports = router;