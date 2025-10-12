import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthProvider } from '@gym-management/common';

/**
 * Facebook OAuth2 strategy
 */
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const clientID = configService.get('FACEBOOK_APP_ID') || 'dummy';
    const clientSecret = configService.get('FACEBOOK_APP_SECRET') || 'dummy';
    const callbackURL = configService.get('FACEBOOK_CALLBACK_URL') || 
      'http://localhost:3000/api/auth/facebook/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email'],
      profileFields: ['id', 'emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    done: (error: any, user?: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<void> {
    const { id, emails, name } = profile;
    const email = emails[0].value;

    const user = await this.authService.findOrCreateOAuthUser(
      email,
      AuthProvider.FACEBOOK,
      id,
      {
        firstName: name.givenName,
        lastName: name.familyName,
      }
    );

    done(null, user);
  }
}

