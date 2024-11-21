import { z } from 'zod';

import dbSchema from './db.schema';
import { JobApplicationStatus } from './jobApplication.status';

const statusEnum = z.nativeEnum(JobApplicationStatus);

// Entity
export const jobApplicationSchema = dbSchema
  .extend({
    company: z
      .string()
      .min(1, 'Укажите название компании')
      .min(3, 'Название компании должно содержать не менее 3 символов')
      .max(100),
    vacancy: z
      .string()
      .min(1, 'Укажите название вакансии')
      .min(2, 'Название вакансии должно содержать не менее 2 символов')
      .max(100),
    salaryMin: z.number().min(0, 'Зарплата не может быть меньше 0'),
    salaryMax: z.number().min(0, 'Зарплата не может быть меньше 0'),
    status: statusEnum.default(JobApplicationStatus.APPLIED),
    notes: z.string().optional().default(''),
    userId: z.string(),
  })
  .strip();

// Create dto
export const createJobApplicationSchema = jobApplicationSchema
  .omit({
    _id: true,
    createdOn: true,
    updatedOn: true,
    deletedOn: true,
    userId: true,
  })
  .extend({
    salaryMin: z.coerce.number().min(0),
    salaryMax: z.coerce.number().min(0),
  });

// Update dto
export const updateJobApplicationSchema = createJobApplicationSchema.partial();

// Update status dto
export const updateStatusSchema = jobApplicationSchema.pick({ status: true });
