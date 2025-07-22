import AssistanceModel from "@models/assistance.model";

export const createAssistance = async ({
  studentName,
  classId,
  subject,
  assignmentId,
  assignmentName,
  assignmentDescription,
  assistantResponse,
}: {
  studentName: string;
  classId: string;
  subject: string;
  assignmentId: string;
  assignmentName: string;
  assignmentDescription: string;
  assistantResponse: string;
}) => {
  const assistanceDocs = await AssistanceModel.create({
    studentName,
    classId,
    subject,
    assignmentId,
    assignmentDescription,
    assistantResponse,
    assignmentName,
  });

  return assistanceDocs;
};

export const getAssistancesByClass = async (classId: string) => {
  const assistances = await AssistanceModel.find({ classId }).sort({
    createdAt: -1,
  });
  return assistances;
};

export const getAssistancesByClassAndSubject = async (
  classId: string,
  subject: string
) => {
  const assistances = await AssistanceModel.find({
    classId,
    subject,
  }).sort({ createdAt: -1 });

  return assistances;
};

export const updateAssistance = async (
  assistanceId: string,
  assistantResponse: string
) => {
  const updatedAssistance = await AssistanceModel.findByIdAndUpdate(
    assistanceId,
    { assistantResponse },
    { new: true }
  );
  return updatedAssistance;
};
