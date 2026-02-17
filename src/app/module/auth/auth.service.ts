
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";


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

export const AuthService = {
    registerPaitent,
    loginPatient
}