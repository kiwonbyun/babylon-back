import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isImage', async: false })
export class IsImageConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File) {
    if (!file) {
      return false;
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return allowedMimeTypes.includes(file.mimetype);
  }
}

export function IsImage(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'isImage',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsImageConstraint,
    });
  };
}
