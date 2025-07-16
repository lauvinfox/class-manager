import { RequestHandler } from "express";
import catchError from "@utils/error";
import * as OpenAIService from "@services/openai.service";

/**
 * Handle OpenAI API requests
 */
export const handleOpenAIRequest: RequestHandler = catchError(
  async (req, res) => {
    const { prompt } = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        message: "Invalid prompt provided",
      });
    }

    // Call OpenAI service to get response
    const response = await OpenAIService.getOpenAIResponse(prompt);

    return res.status(200).json({
      message: "OpenAI response retrieved successfully",
      data: response,
    });
  }
);

export const studentAssignmentAdvice: RequestHandler = catchError(
  async (req, res) => {
    const { studentName, studentScore, averageScore, description, note } =
      req.body;

    if (studentName && typeof studentName !== "string") {
      return res.status(400).json({ message: "Invalid student name" });
    }
    if (studentScore && typeof studentScore !== "number") {
      return res.status(400).json({ message: "Invalid assignment score" });
    }
    if (averageScore && typeof averageScore !== "number") {
      return res.status(400).json({ message: "Invalid average score" });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({ message: "Invalid description" });
    }

    let prompt: string;
    if (studentScore < averageScore) {
      prompt = `Seorang siswa bernama ${studentName} mendapat nilai tugas ${studentScore} dan rata-rata nilai teman kelasnya ${averageScore}. Deskripsi tugas: ${description}. ${note !== undefined ? ` Catatan guru: ${note}` : ""} Apa yang bisa dilakukan untuk meningkatkan nilainya? Ubah karakter ** menjadi <b> dan </b> untuk menebalkan teks.`;
    } else {
      prompt = `Seorang siswa bernama ${studentName} mendapat nilai tugas ${studentScore} dan rata-rata nilai teman kelasnya ${averageScore}. Deskripsi tugas: ${description}. ${note !== undefined ? ` Catatan guru: ${note}` : ""} Apa yang bisa dilakukan untuk mengembangkan bakatnya? Ubah karakter ** menjadi <b> dan </b> untuk menebalkan teks.`;
    }

    const response = await OpenAIService.getAssignmentAdvice(prompt);

    return res.status(200).json({
      message: "Assignment advice retrieved successfully",
      data: response,
    });
  }
);

export const getClassLearningPlan: RequestHandler = catchError(
  async (req, res) => {
    const { subject, topic, level, duration, learningStyle } = req.body;

    // Validate inputs
    if (!subject || typeof subject !== "string") {
      return res.status(400).json({ message: "Invalid subject" });
    }
    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ message: "Invalid topic" });
    }
    if (!level || !["dasar", "menengah", "tinggi"].includes(level)) {
      return res.status(400).json({ message: "Invalid level" });
    }
    if (!duration || typeof duration !== "number") {
      return res.status(400).json({ message: "Invalid duration" });
    }
    if (
      !learningStyle ||
      ![
        "visual",
        "auditory",
        "kinesthetic",
        "reading-writing",
        "collaborative",
        "independent",
        "problem-based",
        "inquiry-based",
      ].includes(learningStyle)
    ) {
      return res.status(400).json({ message: "Invalid learning style" });
    }

    const response = await OpenAIService.getLearningPlan(
      subject,
      topic,
      level,
      duration,
      learningStyle
    );

    return res.status(200).json({
      message: "Learning plan retrieved successfully",
      data: response,
    });
  }
);
