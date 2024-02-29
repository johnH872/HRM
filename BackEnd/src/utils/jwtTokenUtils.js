import jwt from 'jsonwebtoken';
import { TOTP } from 'totp-generator';

const createToken = (user, timeInSeconds) => 
    jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + timeInSeconds,
            user, 
        },
        process.env.ACCESS_TOKEN_SECRET, 
        { algorithm: 'HS256' })

const createOTP = () => {
    const { otp } = TOTP.generate(process.env.OTP_KEY, { digits: 8 });
    return otp;
}

export {
    createToken,
    createOTP
}