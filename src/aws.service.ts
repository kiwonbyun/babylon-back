import * as path from 'path';
import * as AWS from 'aws-sdk';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromiseResult } from 'aws-sdk/lib/request';
import {
  AWS_S3_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_S3_REGION,
  AWS_S3_SECRET_KEY,
} from './common/constants/env-key.const';
import { v4 as uuid } from 'uuid';

// sharp

@Injectable()
export class AwsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;

  constructor(private readonly configService: ConfigService) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get(AWS_S3_ACCESS_KEY),
      secretAccessKey: this.configService.get(AWS_S3_SECRET_KEY),
      region: this.configService.get(AWS_S3_REGION),
    });
    this.S3_BUCKET_NAME = this.configService.get(AWS_S3_BUCKET_NAME);
  }

  async uploadFileToS3(
    folder: string,
    file: Express.Multer.File,
  ): Promise<{
    key: string;
    s3Object: PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>;
    contentType: string;
  }> {
    try {
      const key = `${folder}/${uuid()}_${path.basename(
        file.originalname,
      )}`.replace(/ /g, '');

      const s3Object = await this.awsS3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
        })
        .promise();
      return { key, s3Object, contentType: file.mimetype };
    } catch (error) {
      throw new BadRequestException(`File upload failed : ${error}`);
    }
  }

  async deleteS3Object(
    key: string,
    callback?: (err: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => void,
  ): Promise<{ success: true }> {
    try {
      await this.awsS3
        .deleteObject(
          {
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
          },
          callback,
        )
        .promise();
      return { success: true };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file : ${error}`);
    }
  }

  public getAwsS3FileUrl(objectKey: string) {
    return `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${objectKey}`;
  }

  async uploadFilesAndGetUrl(path: string, files: Express.Multer.File[]) {
    const result = await Promise.all(
      files.map((file: Express.Multer.File) => this.uploadFileToS3(path, file)),
    );
    const newUrlArr = result?.map((obj) => this.getAwsS3FileUrl(obj.key));
    return newUrlArr;
  }

  async uploadFileAndGetUrl(path: string, file: Express.Multer.File) {
    const result = this.uploadFileToS3(path, file);
    const newUrl = this.getAwsS3FileUrl((await result).key);
    return newUrl;
  }
}
