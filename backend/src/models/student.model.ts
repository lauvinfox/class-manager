import { toJSONPlugin } from "@utils/toJSONPlugin";
import { Document, model, Schema } from "mongoose";

export interface IStudent extends Document {
  name: string;
  studentId: number;
  birthDate: Date;
  birthPlace: string;
  contact: string;
  address: string;
  classId: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema<IStudent>({
  name: {
    type: String,
    required: [true, "Name is required"],
    // Perbolehkan huruf, spasi, titik, tanda kutip, dan strip
    match: [
      /^[A-Za-z\s.'-]+$/,
      "Name must contain only alphabets, spaces, dots, apostrophes, or hyphens",
    ],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  birthDate: {
    type: Date,
    required: [true, "Date of Birth is required"],
    validate: {
      validator: function (value: Date) {
        const currentDate = new Date();
        const minDate = new Date();
        minDate.setFullYear(currentDate.getFullYear() - 100);
        return value >= minDate && value <= currentDate;
      },
      message: "Date of Birth must be valid and not more than 100 years ago",
    },
  },
  birthPlace: {
    type: String,
    required: [true, "Birth Place is required"],
    trim: true,
    maxlength: [100, "Birth Place cannot exceed 100 characters"],
  },
  contact: {
    type: String,
    required: [true, "Contact number is required"],
    unique: true, // Ensure contact number is unique
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
    maxlength: [200, "Address cannot exceed 200 characters"],
  },
  studentId: {
    type: Number,
    required: [true, "Student ID is required"],
    validate: {
      validator: function (value: number) {
        return Number.isInteger(value) && value > 0;
      },
      message: "Student ID must be a positive integer",
    },
    index: true, // Add index for faster lookups
  },
  classId: {
    type: String,
    required: [true, "Classroom is required"],
  },
});

// Compound unique index for studentId + classId
StudentSchema.index({ studentId: 1, classId: 1 }, { unique: true });
toJSONPlugin(StudentSchema);

export default model<IStudent>("Student", StudentSchema);
