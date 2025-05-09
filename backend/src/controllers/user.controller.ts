import { RequestHandler } from "express";

import UserModel from "@models/user.model";

export const getUsers: RequestHandler = async (_req, res) => {
  const users = await UserModel.find().exec();

  res.status(200).json({ data: users });
};

export const getUser: RequestHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findOne({ _id: id }).exec();

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.send({ status: 200, data: user });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  try {
    await UserModel.updateOne({ _id: id }, updatedUser);
    res
      .status(200)
      .json({ data: updatedUser, msg: "Data updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Unable to update the contact" });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  const { id } = req.params;

  await UserModel.deleteOne({ _id: id });

  res.status(200).json({ msg: "Data has been deleted" });
};
