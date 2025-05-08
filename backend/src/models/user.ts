import { Document, model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  dateOfBirth: Date;
  dateJoined: string;
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
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/-]).{8,}$/,
        "Password harus mengandung huruf kapital, huruf kecil, angka, dan karakter khusus.",
      ],
    },
    dateOfBirth: { type: Date, required: true },
    dateJoined: {
      type: String,
      default: new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
      }).format(new Date()),
    },
    // gender: { type: String, required: true },
    // address: { type: String, required: true },
    // isEmailVerified: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// UserSchema.pre<IUser>("save", async function (next) {
//   const user = this;

//   if (!user.isModified("password")) {
//     return next();
//   }

//   const hashedPassword = await bcrypt.hash(user.password, 10);
//   user.password = hashedPassword; // TypeScript knows 'user' is of type IUser
//   next();
// });

// UserSchema.methods.matchPassword = async function (enteredPassword: string) {
//   try {
//     const isMatch = await bcrypt.compare(enteredPassword, this.password);

//     // Jika password cocok
//     if (isMatch) {
//       return {
//         success: true,
//         message: "Password matched successfully",
//       };
//     } else {
//       // Jika password tidak cocok
//       return {
//         success: false,
//         message: "Incorrect password",
//       };
//     }
//   } catch (error) {
//     if (error instanceof Error)
//       return {
//         success: false,
//         message: "Error comparing passwords",
//         error: error.message,
//       };
//   }
// };

export default model<IUser>("User", UserSchema);
