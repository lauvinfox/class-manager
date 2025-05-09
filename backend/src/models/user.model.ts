import { dateJoined } from "@utils/date";
import { compareValue, hashValue } from "@utils/hash";
import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  dateOfBirth: Date;
  dateJoined: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    IUser,
    "_id" | "email" | "verified" | "createdAt" | "updatedAt"
  >;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: [3, "Name must be at least 3 characters"],
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
      // match: [
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/-]).{8,}$/,
      //   "Password harus mengandung huruf kapital, huruf kecil, angka, dan karakter khusus.",
      // ],
    },
    dateOfBirth: { type: Date, required: true },
    dateJoined: {
      type: String,
      default: dateJoined,
    },
    verified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

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
