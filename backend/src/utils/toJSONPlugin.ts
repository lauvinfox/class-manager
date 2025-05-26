import { Schema } from "mongoose";

export function toJSONPlugin(schema: Schema) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  });
}
