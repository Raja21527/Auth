const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    console.error("Error during signup:", err);
  }
  if (existingUser) {
    res.status(409).json({ message: "User with this email already exists" });
  }
  const hashedPassword = bcrypt.hashSync(password);
  const user = new User({
    name,
    email,
    password: hashedPassword,
  });
  try {
    await user.save();
  } catch (err) {
    console.log(err);
  }
  res
    .status(201)
    .json({ message: `${name} , you successfully created an account`, user });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({ message: "user not existed" });
    }

    const checkPassword = bcrypt.compareSync(password, existingUser.password);
    if (!checkPassword) {
      return res.status(404).json({ messgae: "wrong password" });
    }
    const token = jwt.sign(
      { id: existingUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "60s",
      }
    );
    if (req.cookies[`${existingUser._id}`]) {
      req.cookies[`${existingUser._id}`] = "";
    }
    res.cookie(existingUser._id, token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60),
      httpOnly: true,
      sameSite: "lax",
    });
    return res
      .status(200)
      .json({ message: "successfully looged in", user: existingUser, token });
  } catch (err) {
    console.log(err);
  }
};

const verifyToken = (req, res, next) => {
  const cookies = req.headers.cookie;
  const token = cookies.split("=")[1];
  if (!token) {
    res.status(404).json({ message: "No token found" });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(404).json({ message: "invalid" });
    }
    console.log(user.id);
    req.id = user.id;
  });
  next();
};

const getUser = async (req, res, next) => {
  const userId = req.id;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    console.log(err);
  }
  return res.json({ user });
};

const refreshToken = (req, res, next) => {
  const cookies = req.headers.cookie;
  console.log("Prev Cookie", cookies);
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({ message: "couldnt find token" });
  }
  jwt.verify(prevToken, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "60s",
    });
    res.cookie(user.id, token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60),
      httpOnly: true,
      sameSite: "lax",
    });

    req.id = user.id;
    next();
  });
};

const logout = (req, res, next) => {
  const cookies = req.headers.cookie;
  console.log("Prev Cookie", cookies);
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({ message: "couldnt find token" });
  }
  jwt.verify(prevToken, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";
    return res.status(200).json({ message: "Successfully logout" });
  });
};

module.exports = { signup, login, verifyToken, getUser, refreshToken, logout };
