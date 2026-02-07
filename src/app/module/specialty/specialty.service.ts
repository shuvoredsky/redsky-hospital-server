import { Speciality } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Speciality): Promise<Speciality> => {
    const specilty = await prisma.speciality.create({
        data: payload
    })
    return specilty
}       



const updateSpecialty = async (id: string, payload: Partial<Speciality>): Promise<Speciality> => {
    const specialty = await prisma.speciality.update({
        where: {
            id: id
        },
        data: payload
    })
    return specialty
}


const getAllSpecialties = async (): Promise<Speciality[]> => {
    const specialties = await prisma.speciality.findMany()
    return specialties
}

const deleteSpecialty = async (id: string): Promise<Speciality> => {
    const specialty = await prisma.speciality.delete({
        where: {
            id: id
        }
    })
    return specialty
}

  

export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialty,
    deleteSpecialty
}