import { Injectable } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import fetch, { Response } from 'node-fetch';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Face } from './face.model';
import { createCanvas, loadImage, Canvas, Image } from 'canvas';

@Injectable()
export class FaceRecognitionService {
  constructor(@InjectModel('Face') private readonly faceModel: Model<Face>) {
    // Set up a virtual canvas
  }

  async addFace(imageUrl: string, details: string, descriptor: number[]): Promise<string> {
    const newFace = new this.faceModel({ imageUrl, details, descriptor });
    await newFace.save();
    return 'Face added successfully';
  }

  async recognizeFace(photoUrl: string): Promise<string | null> {
    if (!photoUrl.startsWith('http://') && !photoUrl.startsWith('https://')) {
      throw new Error('Invalid URL. Only HTTP(S) protocols are supported.');
    }

    try {
      const response = await fetch(photoUrl, {
        headers: { Accept: 'application/octet-stream' },
      }) as Response;

      // Create a Blob from the Buffer
      const blob = new Blob([Buffer.from(await response.arrayBuffer())], { type: 'image/jpeg' });

      const image = await faceapi.bufferToImage(blob);

      // Load face-api.js models
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

      const faceDetections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

      const results = faceDetections.map((faceDescriptor) => faceDescriptor.descriptor);

      console.log('Detected Face Descriptors:', results);

      const recognizedFace = await this.findBestMatch(results);

      if (recognizedFace) {
        console.log('Recognized Face Details:', recognizedFace.details);
        return recognizedFace.details;
      } else {
        console.log('No Match Found');
        return null;
      }
    } catch (error) {
      console.error('Error in recognizeFace:', error);
      throw new Error('Error processing the image.');
    }
  }

  private async findBestMatch(descriptor: Float32Array[]): Promise<Face | null> {
    const faces = await this.faceModel.find();

    const labeledDescriptors = faces.map((face) => ({
      descriptor: new Float32Array(face.descriptor),
      label: face.details,
    }));

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    const bestMatch = faceMatcher.findBestMatch(descriptor[0]);

    return bestMatch ? await this.faceModel.findOne({ details: bestMatch.label }) : null;
  }
}
