
import { Doctor } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllDoctors = async () => {
    const doctors = await prisma.doctor.findMany({
        where: { isDeleted: false }, 
        include: {
            specialities: {
                include: { speciality: true }
            },
            user: true 
        }
    });
    return doctors;
};

const getDoctorById = async (id: string) => {
    const result = await prisma.doctor.findUniqueOrThrow({
        where: { id, isDeleted: false },
        include: {
            specialities: {
                include: { speciality: true }
            },
            user: true
        }
    });
    return result;
};

const updateDoctor = async (id: string, payload: Partial<Doctor>) => {
    await prisma.doctor.findUniqueOrThrow({
        where: { id, isDeleted: false }
    });

    const result = await prisma.doctor.update({
        where: { id },
        data: payload,
        include: {
            specialities: {
                include: { speciality: true }
            }
        }
    });
    return result;
};

const deleteDoctorById = async (id: string) => {
    await prisma.doctor.findUniqueOrThrow({
        where: { id, isDeleted: false }
    });

    
    const result = await prisma.$transaction(async (tx) => {
        const deletedDoctor = await tx.doctor.update({
            where: { id },
            data: { isDeleted: true }
        });

        await tx.user.update({
            where: { id: deletedDoctor.userId },
            data: { isDeleted: true }
        });

        return deletedDoctor;
    });

    return result;
};

export const doctorService = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctorById
};