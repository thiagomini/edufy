import { JwtService } from '@nestjs/jwt';
import { Jwt } from './jwt';

describe('JWT', () => {
  let jwtService: JwtService;
  beforeAll(() => {
    jwtService = new JwtService({
      secret: 'secret',
      signOptions: {
        expiresIn: '1h',
      },
    });
  });
  test('stringifies the JWT correctly', () => {
    const payload = {
      sub: 'a04b78e0-4c14-494d-866f-2587847aa70a',
    };
    const token = jwtService.sign(payload);

    const jwt = new Jwt(token);

    expect(jwt.toString()).toBe(token);
  });
  test('returns the payload', () => {
    const payload = {
      sub: 'a04b78e0-4c14-494d-866f-2587847aa70a',
    };
    const token = jwtService.sign(payload);

    const jwt = new Jwt(token);

    expect(jwt.payload()).toEqual({
      sub: payload.sub,
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });
});
