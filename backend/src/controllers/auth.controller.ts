import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

import UserModel from "@models/user";
import env from "@utils/validateEnv";

const genSalt = 10;

export const signUp: RequestHandler = async (req, res) => {
  const { name, email, username, password, dateOfBirth, dateJoined } = req.body;
  try {
    if (!username || !email || !password) {
      res.status(400).json({ message: "Parameters missing!" });
    }

    // Mengecek username
    const existingUsername = await UserModel.findOne({
      username: username,
    }).exec();

    if (existingUsername) {
      res.status(409).json({ message: "Username is already taken!" });
    }

    // Mengecek email
    const existingEmail = await UserModel.findOne({ email: email }).exec();

    if (existingEmail) {
      res.status(409).json({ message: "Email is already taken!" });
    }

    // Password Hashing
    const hashedPassword = await bcrypt.hash(password, genSalt);

    const newUser = new UserModel({
      name: name,
      email: email,
      username: username,
      password: hashedPassword,
      dateOfBirth: dateOfBirth,
      dateJoined: dateJoined,
    });

    await newUser.save();

    res.status(201).json({
      message: "User data successfully saved",
      data: newUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export const signIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({ message: "Parameters missing!" });
    }

    const foundUser = await UserModel.findOne({ email: email });

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User not found!" });
      return;
    }

    const isPasswordMatch = bcrypt.compareSync(password, foundUser.password);
    if (isPasswordMatch) {
    } else {
      res.status(404).json({ success: false, message: "Wrong password!" });
    }

    // JWT Token
    const accessToken = jwt.sign(
      { username: foundUser.username },
      env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "60s",
      }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 86400000, // Satu hari
    });

    res.status(200).json({
      success: true,
      message: "Login success!",
      data: foundUser,
      accessToken: accessToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
};
