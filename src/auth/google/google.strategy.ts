import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_SECRET,
} from 'src/common/constants/env-key.const';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get(GOOGLE_CLIENT_ID),
      clientSecret: configService.get(GOOGLE_SECRET),
      callbackURL: 'http://localhost:8000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, name, emails, photos } = profile;

    return {
      provider: 'google',
      providerId: id,
      name: name.givenName,
      email: emails[0].value,
      profileImage: photos[0].value,
    };
  }
}
