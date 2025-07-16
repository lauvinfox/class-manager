import { toJSONPlugin } from "@utils/toJSONPlugin";
import { model, Schema, Types } from "mongoose";

interface IAssistance {
  studentName: string;
  classId: string;
  subject: string;
  assignmentId: Types.ObjectId;
  assignmentName: string;
  assignmentDescription: string;
  assistantResponse: string;
}

const AssistanceSchema = new Schema<IAssistance>(
  {
    studentName: {
      type: String,
      required: true,
    },
    classId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    assignmentName: {
      type: String,
      required: true,
    },
    assignmentDescription: {
      type: String,
      required: true,
    },
    assistantResponse: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

AssistanceSchema.plugin(toJSONPlugin);
export default model<IAssistance>("Assistance", AssistanceSchema);
