const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

const User = require("./models/User");

const app = express();


// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ================= REQUEST LOGGER =================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// ================= MONGODB CONNECTION =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });


// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});


// ================= API TEST =================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working successfully!"
  });
});


// ================= SIGN UP =================

app.post("/api/signup", async (req, res) => {

  console.log("SIGNUP REQUEST RECEIVED");
  console.log("BODY:", req.body);

  try {

    const { name, email, password } = req.body;


    // Check required fields
    if (!name || !email || !password) {

      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });

    }


    // Check password length
    if (password.length < 6) {

      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters."
      });

    }


    // Normalize email
    const normalizedEmail =
      email.trim().toLowerCase();


    // Check existing user
    const existingUser =
      await User.findOne({
        email: normalizedEmail
      });


    if (existingUser) {

      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists."
      });

    }


    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);


    // Create user
    const user =
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword
      });


    console.log(
      "USER CREATED:",
      user.email
    );


    return res.status(201).json({

      success: true,

      message:
        "Account created successfully!",

      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }

    });

  } catch (error) {

    console.error(
      "SIGNUP ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Server error. Please try again."

    });

  }

});


// ================= SIGN IN =================

app.post("/api/signin", async (req, res) => {

  console.log("SIGNIN REQUEST RECEIVED");
  console.log("BODY:", req.body);

  try {

    const { email, password } = req.body;


    // Check fields
    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message:
          "Email and password are required."

      });

    }


    // Normalize email
    const normalizedEmail =
      email.trim().toLowerCase();


    // Find user
    const user =
      await User.findOne({
        email: normalizedEmail
      });


    if (!user) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid email or password."

      });

    }


    // Check password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid email or password."

      });

    }


    console.log(
      "SIGNIN SUCCESS:",
      user.email
    );


    return res.json({

      success: true,

      message:
        `Welcome back, ${user.name}!`,

      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }

    });

  } catch (error) {

    console.error(
      "SIGNIN ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Server error. Please try again."

    });

  }

});


// ======================================================
// ================= FORGOT PASSWORD ====================
// ======================================================

app.post(
  "/api/forgot-password",
  async (req, res) => {

    console.log(
      "FORGOT PASSWORD REQUEST RECEIVED"
    );

    try {

      const { email } = req.body;


      // Check email
      if (!email) {

        return res.status(400).json({

          success: false,

          message:
            "Email is required."

        });

      }


      // Normalize email
      const normalizedEmail =
        email.trim().toLowerCase();


      // Find user
      const user =
        await User.findOne({
          email: normalizedEmail
        });


      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "No account found with this email."

        });

      }


      // Generate secure random token
      const resetToken =
        crypto.randomBytes(32).toString("hex");


      // Hash token before saving
      const hashedToken =
        crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");


      // Token expires after 15 minutes
      const expiry =
        new Date(
          Date.now() + 15 * 60 * 1000
        );


      // Save hashed token
      user.resetPasswordToken =
        hashedToken;

      user.resetPasswordExpires =
        expiry;

      await user.save();


      console.log(
        "PASSWORD RESET TOKEN CREATED FOR:",
        user.email
      );


      // ------------------------------------------------
      // DEVELOPMENT TESTING ONLY
      // ------------------------------------------------
      // Later we will send this token by email.
      // For now it is returned so we can test locally.

      return res.json({

        success: true,

        message:
          "Password reset request successful.",

        resetToken: resetToken,

        expiresIn:
          "15 minutes"

      });

    } catch (error) {

      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Server error. Please try again."

      });

    }

  }
);


// ======================================================
// ================= RESET PASSWORD =====================
// ======================================================

app.post(
  "/api/reset-password",
  async (req, res) => {

    console.log(
      "RESET PASSWORD REQUEST RECEIVED"
    );

    try {

      const {
        token,
        password
      } = req.body;


      // Check fields
      if (!token || !password) {

        return res.status(400).json({

          success: false,

          message:
            "Token and new password are required."

        });

      }


      // Password length
      if (password.length < 6) {

        return res.status(400).json({

          success: false,

          message:
            "Password must be at least 6 characters."

        });

      }


      // Hash received token
      const hashedToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");


      // Find user with valid token
      const user =
        await User.findOne({

          resetPasswordToken:
            hashedToken,

          resetPasswordExpires:
            { $gt: new Date() }

        });


      if (!user) {

        return res.status(400).json({

          success: false,

          message:
            "Reset token is invalid or expired."

        });

      }


      // Hash new password
      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      // Update password
      user.password =
        hashedPassword;


      // Remove used reset token
      user.resetPasswordToken =
        null;

      user.resetPasswordExpires =
        null;


      await user.save();


      console.log(
        "PASSWORD RESET SUCCESS:",
        user.email
      );


      return res.json({

        success: true,

        message:
          "Password reset successfully! You can now sign in."

      });

    } catch (error) {

      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Server error. Please try again."

      });

    }

  }
);


// ================= 404 HANDLER =================

app.use((req, res) => {

  console.log(
    `404 ROUTE NOT FOUND: ${req.method} ${req.url}`
  );

  res.status(404).json({

    success: false,

    message:
      `Route not found: ${req.method} ${req.url}`

  });

});


// ================= ERROR HANDLER =================

app.use(
  (err, req, res, next) => {

    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({

      success: false,

      message:
        "Internal server error."

    });

  }
);


// ================= SERVER =================

const PORT =
  process.env.PORT || 5000;


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

    console.log(
      "----------------------------------"
    );

    console.log(
      `Server running on http://127.0.0.1:${PORT}`
    );

    console.log(
      "----------------------------------"
    );

  }
};