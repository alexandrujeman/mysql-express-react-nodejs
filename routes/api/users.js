const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const connection = require("../../config/db");
const { check, validationResult } = require("express-validator");

// @route POST api/users
// @desc Register a user
// @access Public
router.post(
  "/",
  [
    check("name", "Please add name")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const user = {
      name,
      email,
      password
    };
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    try {
      let sql = `SELECT * FROM users WHERE email = "${email}"`;
      connection.query(sql, async (err, results) => {
        if (err) throw err;
        if (!!results.length) {
          return res.status(400).json({ msg: "User already exists" });
        } else {
          let sqlInsert = `INSERT INTO users (name, email, password) VALUES ("${user.name}", "${user.email}", "${user.password}")`;
          await connection.query(sqlInsert, (err, results) => {
            if (err) throw err;
          });
          const payload = {
            user: {
              email: user.email
            }
          };
          jwt.sign(
            payload,
            config.get("jwtSecret"),
            {
              expiresIn: 36000
            },
            (err, token) => {
              if (err) throw err;
              res.json({ token });
            }
          );
        }
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
