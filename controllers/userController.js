// const userModel = require("../models/userModel");

// const loginController = async (req, res) => {
//   try {
//     const user = await userModel.findOne({
//       userId: req.body.userId,
//       password: req.body.password,
//       verified: true,
//     });
//     if (user) {
//       res.send(user);
//     } else {
//       res.status(400).json({ message: "Login failed", user });
//     }
//   } catch (error) {
//     res.status(400).json(error);
//   }
// };

// const registerController = async (req, res) => {
//   try {
//     const newUser = new userModel({ ...req.body, verified: true });
//     await newUser.save();
//     res.send("User Registered successfully");
//   } catch (error) {
//     res.status(400).json(error);
//   }
// };

// module.exports = { loginController, registerController };


const userModel = require("../models/userModel");

// LOGIN
const loginController = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ userId, verified: true });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or not verified" });
    }

    // Simple password check (NOTE: in production, hash passwords with bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // ✅ Expected API Response format
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        role: user.role || "user",
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// REGISTER
const registerController = async (req, res) => {
  try {
    const { userId, password, name } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = new userModel({
      userId,
      password,
      name,
      verified: true, // Auto-verify for now
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: newUser._id,
        userId: newUser.userId,
        name: newUser.name,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

module.exports = { loginController, registerController };
