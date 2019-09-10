const express = require("express");
const Message = require("../models/message");
const router = express.Router();
const auth = require("../middleware/auth");

/** GET /:id - get detail of message.
 * 
 * 
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', auth.authenticateJWT, async function (req, res, next) {
  try {
    let id = req.params.id;
    let currentUser = req.user.username
    message = await Message.get(id)
    let toUser = message.to_user.username
    let fromUser = message.from_user.username

    if (currentUser === toUser || currentUser === fromUser) {
      return res.json(message)
    }
  } catch (err) {
    return next(err);
  }
})
/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", auth.authenticateJWT, async function (req, res, next) {
  try {
    let from_username = req.user.username
    let { to_username, body } = req.body;
    let result = await Message.create({ from_username, to_username, body })
    return res.json({ message: result })
  } catch (err) {
    return next(err);
  }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", auth.authenticateJWT, async function (req, res, next) {
  try {
    let id = req.params.id;
    let currentUser = req.user.username
    message = await Message.markRead(id)
    let toUser = message.to_username
    if (currentUser === toUser){
      return res.json(message)
    }
  } catch (err) {
    return next(err);
  }
})


module.exports = router;