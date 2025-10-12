import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthProvider } from '@gym-management/common';

/**
 * Google OAuth2 strategy
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const clientID = configService.get('GOOGLE_CLIENT_ID') || 'dummy';
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET') || 'dummy';
    const callbackURL = configService.get('GOOGLE_CALLBACK_URL') || 
      'http://localhost:3000/api/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    done: VerifyCallback
  ): Promise<void> {
    const { id, emails, name } = profile;
    const email = emails[0].value;

    const user = await this.authService.findOrCreateOAuthUser(
      email,
      AuthProvider.GOOGLE,
      id,
      {
        firstName: name.givenName,
        lastName: name.familyName,
      }
    );

    done(null, user);
  }
}

