import { Speciality } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Speciality): Promise<Speciality> => {
    const specilty = await prisma.speciality.create({
        data: payload
    })
    return specilty
}                   
  

export const SpecialtyService = {
    createSpecialty
}