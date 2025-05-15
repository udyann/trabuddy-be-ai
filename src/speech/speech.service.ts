import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { SpeechClient, protos } from '@google-cloud/speech';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class SpeechService {
  private readonly client = new SpeechClient();

  private async convertM4aToWav(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .audioCodec('pcm_s16le') // LINEAR16 format
        .audioChannels(1)
        .audioFrequency(16000)
        .format('wav')
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  async transcribe(base64Audio: string): Promise<string> {
    const id = uuidv4();
    const inputPath = path.join(tmpdir(), `${id}.m4a`);
    const outputPath = path.join(tmpdir(), `${id}.wav`);

    try {
      // Save base64 to .m4a
      const buffer = Buffer.from(base64Audio, 'base64');
      await fs.writeFile(inputPath, buffer);

      // Convert to LINEAR16 wav
      await this.convertM4aToWav(inputPath, outputPath);

      // Read wav and transcribe
      const wavBase64 = (await fs.readFile(outputPath)).toString('base64');

      const [response] = await this.client.recognize({
        audio: { content: wavBase64 },
        config: {
          encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
          sampleRateHertz: 16000,
          languageCode: 'ko-KR',
        },
      });

      return (response.results ?? [])
        .map(r => r.alternatives?.[0]?.transcript)
        .filter(Boolean)
        .join('\n');
    } catch (err) {
      console.error('STT error:', err);
      throw new InternalServerErrorException('음성 인식 실패');
    } finally {
      await Promise.allSettled([
        fs.unlink(inputPath),
        fs.unlink(outputPath),
      ]);
    }
  }
}
