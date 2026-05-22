import z from 'zod'

export const createTaskInput = z.object({
  options: z.array(
    z.object({
      imageUrl: z.string()
    })
  ).min(2),
  title: z.string().optional(),
  signature: z.string()
});

export const createSubmissionInput = z.object({
  taskId: z.string(),       // this will be a MongoDB ObjectId as string
  selection: z.string()     // this should also be a MongoDB ObjectId as string
});


