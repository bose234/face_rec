// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaceRecognitionController } from './app.controller';
import { FaceRecognitionService } from './app.service';
import { FaceModel, FaceSchema } from './face.model';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/face_rec'),
    MongooseModule.forFeature([{ name: 'Face', schema: FaceSchema }]),
  ],
  controllers: [FaceRecognitionController],
  providers: [FaceRecognitionService],
})
export class AppModule {}
