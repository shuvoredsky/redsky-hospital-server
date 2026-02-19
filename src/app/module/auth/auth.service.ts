
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interface/requestUser.interface";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";


interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}

const registerPaitent = async(payload: IRegisterPatientPayload)=>{
    const {name, email, password} = payload;

    const data = await auth.api.signUpEmail({
        body:{
            name,
            email,
            password,
            
        }
    })

    if(!data.user){
        // throw new Error("Failed to register patient");
        throw new AppError(status.BAD_REQUEST, "Failed to register patient");
    }


   try{
     const patient =  await prisma.$transaction(async (tx: any)=>{
        const patientTx =  await tx.patient.create({
            data:{
                userId: data.user.id,
                name: payload.name,
                email: payload.email,
            }
        })
        return patientTx;
        
    })


    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,

    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,

    })


     return {
        ...data,
        accessToken,
        refreshToken,
        patient
    }
   } catch(error){
    console.log("Transaction Error: ", error);
    await prisma.user.delete  ({
        where:{
            id: data.user.id
        }
    })
    throw error
   }


   


}


interface ILoginPatientPayload {
    email: string;
    password: string;
}

const loginPatient = async( 
    payload: ILoginPatientPayload
)=>{
    const {email, password} = payload;
    const data = await auth.api.signInEmail({
        body:{
            email,
            password
        }
    })

    if(data.user.status === UserStatus.BLOCKED){
        // throw new Error("Your account is blocked. Please contact support.");
        throw new AppError(status.FORBIDDEN, "Your account is blocked. Please contact support.");
    }

    if(data.user.isDeleted || data.user.status === UserStatus.DELETED){
        // throw new Error("Your account is deleted. Please contact support.");

        throw new AppError(status.NOT_FOUND, "Your account is deleted. Please contact support.");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,

    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,

    })

    return {
        ...data,
        accessToken,
        refreshToken
    }

}


const getMe = async(user: IRequestUser)=>{
const isUserExists = await prisma.user.findUnique({
    where:{
        id: user.userId
    },
    include:{
        patient: {
            include:{
                appointments: true,
                prescriptions: true,
                reviews: true,
                medicalReports: true,
                patientHealthData: true,
            }
        },
        doctor: {
            include:{
                specialities: true,
                appointments: true,
                reviews: true,
                prescriptions: true,
            }
        },
        admin: true,
    }
})


if(!isUserExists){
    throw new AppError(status.NOT_FOUND, "User not found");
}

return isUserExists;


}


const getNewToken = async (refreshToken: string, sessionToken: string )=>{

    const isSessionTokenExists = await prisma.session.findUnique({
        where:{
            token: sessionToken,
        },
        include:{
            user: true,
        }
    })


    if(!isSessionTokenExists){
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access token is invalid");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)

    

    if(!verifiedRefreshToken.success && verifiedRefreshToken.error){
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access token is invalid");
    }

    const data = verifiedRefreshToken.data as JwtPayload;


    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,

    })

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,

    })


    const {token} = await prisma.session.update({
        where:{
            token: sessionToken
        },
        data:{
            token: sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date(),
        }
    })

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token,
    }


}

export const AuthService = {
    registerPaitent,
    loginPatient,
    getMe,
    getNewToken
}