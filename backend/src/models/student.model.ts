// import { model, Schema } from "mongoose";

// export interface IStudent {
//   name: string;
//   birthOfDate: Date;
//   studentId: number;
// }

// const StudentSchema = new Schema<IStudent>(
//   {
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       match: [/^[A-Za-z\s]+$/, "Name must contain only alphabets and spaces"],
//       trim: true,
//     },
//     birthOfDate: {
//       type: Date,
//       required: [true, "Date of Birth is required"],
//     },
//     studentId: {
//       type: Number,
//       required: [true, "Student ID is required"],
//       unique: [true, "Student Id has been taken."],
//     },
//   },
//   { timestamps: true }
// );

// const StudentModel = model<IStudent>("Student", StudentSchema);

// export default StudentModel;

import { Document, model, Schema } from "mongoose";

export interface IStudent extends Document {
  name: string;
  birthOfDate: Date;
  studentId: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      match: [/^[A-Za-z\s]+$/, "Name must contain only alphabets and spaces"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    birthOfDate: {
      type: Date,
      required: [true, "Date of Birth is required"],
      validate: {
        validator: function (value: Date) {
          const currentDate = new Date();
          const minDate = new Date();
          minDate.setFullYear(currentDate.getFullYear() - 100); // Maximum 100 years old
          return value >= minDate && value <= currentDate;
        },
        message: "Date of Birth must be valid and not more than 100 years ago",
      },
    },
    studentId: {
      type: Number,
      required: [true, "Student ID is required"],
      unique: [true, "Student ID has been taken"],
      validate: {
        validator: function (value: number) {
          return Number.isInteger(value) && value > 0;
        },
        message: "Student ID must be a positive integer",
      },
      index: true, // Add index for faster lookups
    },
  },
  {
    timestamps: true,
    // Add toJSON transform to modify the output
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default model<IStudent>("Student", StudentSchema);
