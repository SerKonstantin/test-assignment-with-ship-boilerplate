import db from 'db';

import { jobApplicationSchema } from 'schemas';
import { JobApplication } from 'types';

const service = db.createService<JobApplication>('job-applications', {
  schemaValidator: (obj) => jobApplicationSchema.parseAsync(obj),
});

export default service;
