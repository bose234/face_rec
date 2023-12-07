// face.model.ts
import * as mongoose from 'mongoose';

export interface Face {
  imageUrl: string;
  details: string;
  descriptor: number[];
}

export const FaceSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  details: { type: String, required: true },
  descriptor: { type: [Number], required: true },
});

export const FaceModel = mongoose.model<Face>('Face', FaceSchema);
