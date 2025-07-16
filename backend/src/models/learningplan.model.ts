import { toJSONPlugin } from "@utils/toJSONPlugin";
import { model, Schema } from "mongoose";

interface ILearningPlan {
  classId: string;
  subject: string;
  topic: string;
  level: "dasar" | "menengah" | "tinggi";
  duration: number;
  learningStyle:
    | "visual"
    | "auditory"
    | "kinesthetic"
    | "reading-writing"
    | "collaborative"
    | "independent"
    | "problem-based"
    | "inquiry-based";
  learningPlan: string;
}

const LearningPlanSchema = new Schema<ILearningPlan>({
  classId: {
    type: String,
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    enum: ["dasar", "menengah", "tinggi"],
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  learningStyle: {
    type: String,
    enum: [
      "visual",
      "auditory",
      "kinesthetic",
      "reading-writing",
      "collaborative",
      "independent",
      "problem-based",
      "inquiry-based",
    ],
    required: true,
  },
  learningPlan: {
    type: String,
    required: true,
  },
});

LearningPlanSchema.plugin(toJSONPlugin);
export default model<ILearningPlan>("LearningPlan", LearningPlanSchema);
