import jwt from 'jsonwebtoken';

const createToken = (user, timeInSeconds) => 
    jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + timeInSeconds,
            user, 
        },
        process.env.ACCESS_TOKEN_SECRET, 
        { algorithm: 'HS512' })

const createOTP = (user) => {
    
}

export {
    createToken
}