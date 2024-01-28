import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import {User} from '../models/user'

export function authenticate(passport) {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secret0rKey: 'secret'
    }
    passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
        User.findByPk(jwt_payload.id)
        .then((user) => {return done(null, user)})
        .catch((error) => {return done(error,false)})
    }));
}
