import JournalModel, { IJournal } from "@models/journal.model";
import { Types } from "mongoose";
import appAssert from "@utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "@constants/statusCodes";

export const createJournal = async (data: Partial<IJournal>) => {
  const journal = new JournalModel(data);
  return await journal.save();
};

export const getAllJournals = async () => {
  return await JournalModel.find()
    .populate("classroom")
    .populate("session")
    .populate("attendances.student");
};

export const getJournalById = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid journal ID");
  const journal = await JournalModel.findById(id)
    .populate("classroom")
    .populate("session")
    .populate("attendances.student");
  appAssert(journal, NOT_FOUND, "Journal not found");
  return journal;
};

export const updateJournal = async (id: string, update: Partial<IJournal>) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid journal ID");
  const updated = await JournalModel.findByIdAndUpdate(id, update, {
    new: true,
  });
  appAssert(updated, NOT_FOUND, "Journal not found");
  return updated;
};

export const deleteJournal = async (id: string) => {
  appAssert(Types.ObjectId.isValid(id), BAD_REQUEST, "Invalid journal ID");
  const deleted = await JournalModel.findByIdAndDelete(id);
  appAssert(deleted, NOT_FOUND, "Journal not found");
  return deleted;
};
