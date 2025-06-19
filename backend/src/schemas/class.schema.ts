import { z } from "zod";

export const ScheduleSchema = z.array(
  z.object({
    day: z.enum([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Start time must be in HH:MM format (24-hour)",
    }),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "End time must be in HH:MM format (24-hour)",
    }),
  })
);

export const CreateClassSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export type CreateClassParams = z.infer<typeof CreateClassSchema>;
export type UpdateClassParams = Partial<CreateClassParams>;
