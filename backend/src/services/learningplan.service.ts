import LearningPlanModel from "@models/learningplan.model";

export const createLearningPlan = async (
  classId: string,
  subject: string,
  topic: string,
  level: "dasar" | "menengah" | "tinggi",
  duration: number,
  learningStyle:
    | "visual"
    | "auditory"
    | "kinesthetic"
    | "reading-writing"
    | "collaborative"
    | "independent"
    | "problem-based"
    | "inquiry-based",
  learningPlan: string
) => {
  const learningPlanDocs = await LearningPlanModel.create({
    classId,
    subject,
    topic,
    level,
    duration,
    learningStyle,
    learningPlan,
  });

  return learningPlanDocs;
};

export const getLearningPlansByClass = async (classId: string) => {
  const learningPlans = await LearningPlanModel.find({ classId }).sort({
    createdAt: -1,
  });

  return learningPlans;
};

export const getLearningPlansByClassAndSubject = async (
  classId: string,
  subject: string
) => {
  const learningPlans = await LearningPlanModel.find({
    classId,
    subject,
  }).sort({ createdAt: -1 });

  return learningPlans;
};

export const updateLearningPlan = async (
  learningPlanId: string,
  learningPlan: string
) => {
  const updatedLearningPlan = await LearningPlanModel.findByIdAndUpdate(
    learningPlanId,
    { learningPlan },
    { new: true }
  );

  return updatedLearningPlan;
};
