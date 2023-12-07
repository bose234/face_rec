// face-recognition.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { FaceRecognitionService } from './app.service';
import { Face } from './face.model';

@Controller('face')
export class FaceRecognitionController {
  constructor(private readonly faceRecognitionService: FaceRecognitionService) {}

  @Post('add')
  async addFace(@Body() body: Face): Promise<string> {
    return this.faceRecognitionService.addFace(body.imageUrl, body.details, body.descriptor);
  }

  @Post('recognize')
  async recognizeFace(@Body() body: { photoUrl: string }): Promise<string | null> {
    return this.faceRecognitionService.recognizeFace(body.photoUrl);
  }
}
