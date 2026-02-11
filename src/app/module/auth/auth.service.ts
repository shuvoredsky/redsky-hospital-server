
import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";


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
        throw new Error("Failed to register patient");
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

     return {
        ...data,
        patient
    }
   } catch(error){
    console.log("Transaction Error: ", error);
    throw error;
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
        throw new Error("Your account is blocked. Please contact support.");
    }

    if(data.user.isDeleted || data.user.status === UserStatus.DELETED){
        throw new Error("Your account is deleted. Please contact support.");
    }

    return data;
}

export const AuthService = {
    registerPaitent,
    loginPatient
}