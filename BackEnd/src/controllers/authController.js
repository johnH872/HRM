import jwt from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import db from '../models/index.js';
import { createOTP, createToken } from '../utils/jwtTokenUtils.js';
import { TokenType } from '../models/enums/tokenType.js';
import { ReturnResult } from '../models/DTO/returnResult.js';
import { sendEmail } from '../utils/emailUtil.js';
import moment from 'moment/moment.js';
import { EmailType } from '../models/enums/emailType.js';
const dbContext = await db;
class authController {
    // [POST] /login
    async login(req, res, next) {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json("All fields are madatory");
            return;
        }

        const user = await dbContext.User.findOne({
            where: { email: email },
            include: {
                model: dbContext.Role,
                attributes: ['roleId','roleName','displayName'],
                through: {
                    attributes: [],
                }
            }
        });

        // var roles = user.Roles.map(x => {x.roleId);

        //compare password with hashed password
        if (user && (await compare(password, user.password))) {
            // 10 hours access token
            const accessToken = createToken(
                {
                    userId: user.userId,
                    firstName: user.firstName,
                    middleName: user.middleName,
                    lastName: user.lastName,
                    email: user.email,
                    jobTitle: user.jobTitle,
                    ownerId: user.ownerId,
                    avatarUrl: user.avatarUrl,
                    roles: user.Roles
                }, 10 * 60 * 60);
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
                const user = await dbContext.User.findOne({ where: { email: email } });
                if (user) {
                    let existedToken = await dbContext.Token.findOne({ where: { userId: user.userId, type: TokenType.RESET_PASSWORD } });
                    if (!existedToken) {
                        // 30 minutes reset password token
                        const newToken = createToken(
                            {
                                id: user.userId
                            });
                        const savedToken = await dbContext.Token.create({
                            userId: user.userId,
                            token: newToken,
                            type: TokenType.RESET_PASSWORD,
                        });

                        responseToken = savedToken.token;
                    } else responseToken = existedToken.token;
                    const link = `${process.env.FRONT_END_BASE_URL}/auth/reset-password/${responseToken}`;
                    await sendEmail(user.email, "Reset password", link, EmailType.RESET_PASSWORD);
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
    async changePassword(req, res, next) {
        var result = new ReturnResult();
        try {
            var userId = jwt.decode(req.params.token).user.id;
            var user = await dbContext.User.findByPk(userId);
            if (user) {
                let token = await dbContext.Token.findOne({ where: { userId: user.userId, type: TokenType.RESET_PASSWORD } });
                if (token) {
                    await dbContext.Token.destroy({ where: { tokenId: token.tokenId } });
                    user.password = await hash(req.body.password, 10);
                    await user.save();
                    result.result = "Change password successfully.";
                }
            }
        }
        catch (error) {
            console.log(error);
        }
        res.status(200).json(result);
    }

    async generateOTP(req, res, next) {
        var result = new ReturnResult();
        try {
            var { email } = req.body;
            if (email) {
                const user = await dbContext.User.findOne({ where: { email: email } });
                if (user) {
                    let existedToken = await dbContext.Token.findOne({ where: { userId: user.userId, type: TokenType.MOBILE_OTP } });
                    if (existedToken) await dbContext.Token.destroy({ where: { tokenId: existedToken.tokenId } });
                    // 5 minutes OTP
                    const otp = createOTP();
                    const savedToken = await dbContext.Token.create({
                        userId: user.userId,
                        token: otp,
                        expiredAt: moment(new Date()).add(5, "m").toDate(),
                        type: TokenType.MOBILE_OTP,
                    });
                    if (savedToken) await sendEmail(user.email, "Your OTP", otp, EmailType.SEND_OTP);
                }
                result.result = "An OTP has been sent to your email.";
            }
        } catch (error) {
            console.log(error);
        }
        res.status(200).json(result);
    }

    async validateOTP(req, res, next) {
        var result = new ReturnResult();
        try {
            var { otp, email } = req.body;
            const user = await dbContext.User.findOne({ where: { email: email } });
            const otpObject = await dbContext.Token.findOne({ where: { userId: user.userId, type: TokenType.MOBILE_OTP, token: otp } });
            if (otpObject && otpObject?.expiredAt?.getTime() > new Date().getTime()) result.result = true;
            else result.result = false;
        } catch (error) {
            console.log(error);
        }
        res.status(200).json(result);
    }

    async changePasswordOTP(req, res, next) {
        var result = new ReturnResult();
        try {
            var { email, password } = req.body;
            const user = await dbContext.User.findOne({ where: { email: email } });
            if (user) {
                let token = await dbContext.Token.findOne({ where: { userId: user.userId, type: TokenType.MOBILE_OTP } });
                if (token) {
                    await dbContext.Token.destroy({ where: { tokenId: token.tokenId } });
                    user.password = await hash(password, 10);
                    await user.save();
                    result.result = "Change password successfully.";
                }
            }
        }
        catch (error) {
            console.log(error);
        }
        res.status(200).json(result);
    }
}

export default new authController;