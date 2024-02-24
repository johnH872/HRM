import jwt from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import db from '../models/index.js';
import { createToken } from '../utils/jwtTokenUtils.js';
import { TokenType } from '../models/enums/tokenType.js';
import { ReturnResult } from '../models/DTO/returnResult.js';
import { sendEmail } from '../utils/emailUtil.js';
const dbContext = await db;
class authController {
    // [POST] /register
    // async register(req, res, next) {
    //     const { firstName, lastName, email, password, role } = req.body;
    //     if (!firstName || !email || !password) {
    //         res.status(400);
    //         throw new Error("All fields are madatory");
    //     }
    //     const userAvailable = await await dbContext.User.findOne({
    //         where: {
    //             email: email
    //         }  
    //     });

    //     if (userAvailable) {
    //         res.status(400).json("Email đã được đăng ký, vui lòng chọn email khác!");
    //         return;
    //     }

    //     //Hash password
    //     const hashedPassword = await hash(password, 10);

    //     const user = await dbContext.User.create({
    //         displayName: firstName + " " + lastName,
    //         email,
    //         password: hashedPassword,
    //         userDetail: userDetail,
    //         role
    //     });

    //     if (user) {
    //         const accessToken = createToken(
    //             {
    //                 displayName: user.displayName,
    //                 email: user.email,
    //                 id: user.id,
    //                 role: user.role,
    //             });

    //         res.status(200).json({ accessToken });
    //     } else {
    //         res.status(400).json("Email hoặc mật khẩu không hợp lệ!");
    //     }
    // }

    // [POST] /login
    async login(req, res, next) {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json("All fields are madatory");
            return;
        }

        const user = await dbContext.User.findOne({
            where: {
                email: email
            }  
        });

        //compare password with hashed password
        if (user && (await compare(password, user.password))) {
            // 10 hours access token
            const accessToken = createToken(
                {
                    firstName: user.firstName,
                    email: user.email,
                    id: user.userId
                }, 10*60*60);
            res.status(200).json({ accessToken });
        } else {
            res.status(401).json("Inavlid email or password!");
            return;
        }
    }

    //[POST] 
    async sendEmailResetPassword(req, res, next) {
        var result = new ReturnResult();
        try {
            var { email } = req.body;
            var responseToken = "";
            if (email) {
                const user = await dbContext.User.findOne({ where: {email: email} });
                if(user) {
                    let existedToken = await dbContext.Token.findOne({ where: {userId: user.userId, type: TokenType.ResetPassword}});
                    if (!existedToken) {
                        // 30 minutes reset password token
                        const newToken = createToken(
                            {
                                id: user.userId
                            });
                        const savedToken = await dbContext.Token.create({
                            userId: user.userId,
                            token: newToken,
                            type: TokenType.ResetPassword,
                        });

                        responseToken = savedToken.token;
                    } else responseToken = existedToken.token;
                    const link = `${process.env.FRONT_END_BASE_URL}/auth/reset-password/${responseToken}`;
                    await sendEmail(user.email, "Reset password", link);
                }
                result.result = "The password change request has been sent to your email.";
            }   
        }
        catch (error) {
            console.log(error);
        }
        res.status(200).json(result);
    }

    // [POST]
    async changePassword(req, res, next){
        var result = new ReturnResult();
        try {
            var userId = jwt.decode(req.params.token).user.id;
            var user = await dbContext.User.findByPk(userId);
            if(user) {
                let token = await dbContext.Token.findOne({ where: {userId: user.userId, type: TokenType.ResetPassword}});
                if(token) {
                    await dbContext.Token.destroy({where: {tokenId: token.tokenId}});
                    user.password = await hash(req.body.password, 10); 
                    await user.save();
                    result.result = "Change password successfully.";
                }
            }
        }
        catch(error) {
            console.log(error);
        }
        res.status(200).json(result);
    }

    async generateOTP(req, res, next) {
        var result = new ReturnResult();
        try {
            var { email } = req.body;
            var responseToken = "";
            if (email) {
                const user = await dbContext.User.findOne({ where: {email: email} });
                if(user) {
                    let existedToken = await dbContext.Token.findOne({ where: {userId: user.userId,type: TokenType.MobileOTP}});
                    if (!existedToken) {
                        // 30 minutes reset password token
                        const newToken = createToken(
                            {
                                id: user.userId
                            });
                        const savedToken = await dbContext.Token.create({
                            userId: user.userId,
                            token: newToken,
                            type: TokenType.ResetPassword,
                        });

                        responseToken = savedToken.token;
                    } else responseToken = existedToken.token;
                    const link = `${process.env.FRONT_END_BASE_URL}/auth/reset-password/${responseToken}`;
                    await sendEmail(user.email, "Reset password", link);
                }
                result.result = "The password change request has been sent to your email.";
            }   
        } catch(error) {
            console.log(error);
        }
        res.status(200).json(result);
    }
}

export default new authController;