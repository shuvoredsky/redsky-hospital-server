import z from "zod";

const createSpecialtySchema = z.object({
    title: z.string("Title is required"),
    description: z.string("Description is required").optional(),
    icon: z.string("Icon is required").optional(),
    
})

export const specialityValidationSchema ={
    createSpecialtySchema
}