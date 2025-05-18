import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// GET
async function getUsers(req, res) {
  try {
    const users = await User.findAll();
    res.status(200).json({
      status: "Success",
      message: "Users Retrieved",
      data: users,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

// GET BY ID
async function getUserById(req, res) {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
      const error = new Error("User tidak ditemukan 😮");
      error.statusCode = 400;
      throw error;
    }
    res.status(200).json({
      status: "Success",
      message: "User Retrieved",
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

// CREATE
async function createUser(req, res) {
  try {
    const { name, email, gender, password } = req.body;
    if (!name || !email || !gender || !password) {
      const msg = `field cannot be empty 😠`;
      const error = new Error(msg);
      error.statusCode = 401;
      throw error;
    }
    const encryptedPassword = await bcrypt.hash(password, 5);
    await User.create({
      name: name,
      email: email,
      gender: gender,
      password: encryptedPassword,
    });
    res.status(201).json({
      status: "Success",
      message: "User Created",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

async function updateUser(req, res) {
  try {
    const { name, email, gender, password } = req.body;
    const ifUserExist = await User.findOne({ where: { id: req.params.id } });

    if (!name || !email || !gender || !password) {
      const msg = `field cannot be empty 😠`;
      const error = new Error(msg);
      error.statusCode = 401;
      throw error;
    }

    if (!ifUserExist) {
      const error = new Error("User tidak ditemukan 😮");
      error.statusCode = 400;
      throw error;
    }
    const encryptedPassword = await bcrypt.hash(password, 5);
    const updatedData = {
      name: name,
      email: email,
      gender: gender,
      password: encryptedPassword,
    };
    await User.update(updatedData, {
      where: { id: req.params.id },
    });

    res.status(200).json({
      status: "Success",
      message: "User Updated",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

async function deleteUser(req, res) {
  try {
    const ifUserExist = await User.findOne({ where: { id: req.params.id } });
    if (!ifUserExist) {
      const error = new Error("User tidak ditemukan 😮");
      error.statusCode = 400;
      throw error;
    }

    await User.destroy({ where: { id: req.params.id } });
    res.status(200).json({
      status: "Success",
      message: "User Deleted",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

//Nambah fungsi buat login handler
async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      const userPlain = user.toJSON(); // Konversi ke object
      const { password: _, refresh_token: __, ...safeUserData } = userPlain;

      // Check if user already has an active session
      if (user.refresh_token) {
        try {
          // Verify if the token is still valid
          const isValidToken = jwt.verify(
            user.refresh_token,
            process.env.REFRESH_TOKEN_SECRET
          );

          if (isValidToken) {
            return res.status(403).json({
              status: "Failed",
              message: "User already logged in on another device",
              alreadyLoggedIn: true,
            });
          }
        } catch (tokenError) {
          // Token is invalid/expired, can proceed with login
          console.log("Previous token expired, allowing new login");
        }
      }

      const decryptPassword = await bcrypt.compare(password, user.password);
      if (decryptPassword) {
        const accessToken = jwt.sign(
          safeUserData,
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15m",
          }
        );

        // Generate a unique device identifier to store with the token
        const deviceId = req.headers["user-agent"] || "unknown-device";

        const refreshToken = jwt.sign(
          { ...safeUserData, deviceId },
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: "7d",
          }
        );

        await User.update(
          { refresh_token: refreshToken },
          {
            where: {
              id: user.id,
            },
          }
        );

        res.cookie("refreshToken", refreshToken, {
          httpOnly: false,
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
          secure: true,
        });

        // Include expiration information in response
        const tokenInfo = jwt.decode(accessToken);
        const expiresAt = new Date(tokenInfo.exp * 1000).toISOString();

        res.status(200).json({
          status: "Success",
          message: "Login Berhasil",
          safeUserData,
          accessToken,
          tokenExpires: expiresAt,
        });
      } else {
        res.status(400).json({
          status: "Failed",
          message: "Password atau email salah",
        });
      }
    } else {
      res.status(400).json({
        status: "Failed",
        message: "Password atau email salah",
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
  }
}

//nambah logout
async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken; //mgecek refresh token sama gak sama di database
  if (!refreshToken) return res.sendStatus(204);
  const user = await User.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user.refresh_token) return res.sendStatus(204);
  const userId = user.id;
  await User.update(
    { refresh_token: null },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie("refreshToken"); //ngehapus cookies yg tersimpan
  return res.sendStatus(200);
}

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginHandler,
  logout,
};
