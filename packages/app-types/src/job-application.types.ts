import { z } from 'zod';

import { createJobApplicationSchema, jobApplicationSchema, updateJobApplicationSchema } from 'schemas';

export type JobApplication = z.infer<typeof jobApplicationSchema>;
export type CreateJobApplicationParams = z.infer<typeof createJobApplicationSchema>;
export type UpdateJobApplicationParams = z.infer<typeof updateJobApplicationSchema>;
