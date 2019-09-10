/** User class for message.ly */
const db = require("../db")
const { authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser
} = require("../middleware/auth")
const bcrypt = require("bcrypt")


const ds = '2013-03-15 08:50:00';
const day = new Date(ds.replace(' ', 'T') + 'Z');
day.toUTCString()

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    let result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone]);
    return result.rows[0]
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    let userInfo = await db.query(
      `SELECT username, password
      FROM users
      WHERE username = $1`,
      [username]
    )
    if (await bcrypt.compare(password, userInfo.rows[0].password)) {
      this.updateLoginTimestamp(username)
      return true
    } else {
      return false
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await db.query(
      `UPDATE users SET last_login_at=current_timestamp
      WHERE username = $1`,
      [username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    let allUsers = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users`
    );
    console.log("From models ---->", allUsers.rows)
    return allUsers.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    let user = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`,
      [username]
    );
    console.log("From models ---->", user.rows[0])
    return user.rows
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    let messages = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone
      FROM messages AS m
      JOIN users AS u
      ON m.from_username = u.username
      WHERE m.to_username = $1`,
      [username]
    );
    console.log("messages: ", messages)
    let formattedMessages = messages.rows.map(row => {
      return {
        id: row.id,
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at,
        to_user: {
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone
        }
      }
    })
    console.log("From models ---->", formattedMessages)
    return formattedMessages;

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    
    let messages = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone
      FROM messages AS m
      JOIN users AS u
      ON m.to_username = u.username
      WHERE m.from_username = $1`,
      [username]
    );
    console.log("messages: ", messages)
    let formattedMessages = messages.rows.map(row => {
      return {
        id: row.id,
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at,
        from_user: {
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone
        }
      }
    })
    console.log("From models ---->", formattedMessages)
    return formattedMessages;
  }
}


module.exports = User;