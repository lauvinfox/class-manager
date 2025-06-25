import { dateJoined } from "@utils/date";
import { compareValue, hashValue } from "@utils/hash";
import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Document, model, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  dateOfBirth: Date;
  dateJoined: string;
  verified: boolean;
  classes?: { id: Types.ObjectId; classId: string }[];
  classOwned?: { id: Types.ObjectId; classId: string }[];
  subjects?: {
    classId: string;
    subjectId: string;
    subjectName: string;
  }[];
  notifications?: {
    message: string;
    type: "invite" | "other";
    date: Date;
    read: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;

  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    IUser,
    "_id" | "email" | "username" | "verified" | "createdAt" | "updatedAt"
  >;
}

const ClassRefSchema = new Schema(
  {
    classId: { type: String, required: true },
    id: { type: Schema.Types.ObjectId, ref: "Class" },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: [3, "Name must be at least 3 characters"],
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    username: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    dateOfBirth: { type: Date, required: true },
    dateJoined: {
      type: String,
      default: dateJoined,
    },
    verified: { type: Boolean, required: true, default: false },
    classes: [ClassRefSchema],
    classOwned: [ClassRefSchema],
    subjects: [
      {
        classId: { type: String, required: true },
        subjectId: { type: String, required: true },
        subjectName: { type: String, required: true },
      },
    ],
    notifications: [
      {
        message: { type: String, required: true },
        type: { type: String, enum: ["invite", "other"], required: true },
        date: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);
toJSONPlugin(UserSchema);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await hashValue(this.password);
  next();
});

UserSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

UserSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default model<IUser>("User", UserSchema);
