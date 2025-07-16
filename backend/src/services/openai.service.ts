import env from "@utils/env";

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY, // This is the default and can be omitted
});

export const getOpenAIResponse = async (prompt: string) => {
  const response = await client.responses.create({
    model: "gpt-4o",
    instructions:
      "Kamu adalah asisten AI yang membantu untuk memberikan pendapat yang berkaitan dengan pembelajaran. Jelaskan seperti kamu menjelaskan kepada seorang guru.",
    input:
      "Seorang siswa yang bernama Dion, mendapatkan nilai 50 pada tugas dengan deskripsi tugas 'menyelesaikan 10 soal sistem persamaan linier 2 variabel'. Rata rata nilai teman sekelasnya dalam tugas tersebut adalah 70. Berikan pendapat terkait siswa tersebut! Apa yang bisa dilakukan untuk meningkatkan nilainya?",
  });

  return response;
};

export const getAssignmentAdvice = async (prompt: string) => {
  const response = await client.responses.create({
    model: "gpt-4o",
    instructions:
      "Kamu adalah asisten AI yang membantu untuk memberikan pendapat yang berkaitan dengan pembelajaran. Jelaskan seperti kamu menjelaskan kepada seorang guru.",
    input: prompt,
  });

  return response.output_text;
};

export const getLearningPlan = async (
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
    | "inquiry-based"
) => {
  const response = await client.responses.create({
    model: "gpt-4o",
    instructions:
      "Kamu adalah asisten AI yang membantu untuk memberikan rencana pembelajaran yang efektif. Buat rencana pembelajaran yang sesuai dengan subjek, topik, tingkat kesulitan, durasi, dan gaya belajar yang diberikan.",
    input: `Buat rencana pembelajaran untuk subjek ${subject}, topik ${topic}, tingkat kesulitan ${level}, durasi ${duration} jam, dengan gaya belajar ${learningStyle}.`,
  });

  return response.output_text;
};
