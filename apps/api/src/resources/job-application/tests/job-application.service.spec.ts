import { Database } from '@paralect/node-mongo';

import { jobApplicationSchema, JobApplicationStatus } from 'schemas';
import { JobApplication } from 'types';

const database = new Database(process.env.MONGO_URL as string);
const jobApplicationService = database.createService<JobApplication>('job-applications', {
  schemaValidator: (obj) => jobApplicationSchema.parseAsync(obj),
});

jest.mock('routes/middlewares/auth.middleware', () => ({
  authMiddleware: jest.fn((ctx, next) => {
    ctx.state.user = {
      _id: 'user_id',
      email: 'gg@gg.com',
    };
    return next();
  }),
}));

describe('Job application API', () => {
  const USER_ID = 'user_id';

  beforeAll(async () => {
    await database.connect();
  });

  beforeEach(async () => {
    await jobApplicationService.deleteMany({});
  });

  describe('GET job applications', () => {
    it('should return job applications list', async () => {
      await jobApplicationService.insertOne({
        _id: 'job_application_id',
        company: 'Test company',
        position: 'Test position',
        salaryMin: 1000,
        salaryMax: 2000,
        status: JobApplicationStatus.APPLIED,
        userId: USER_ID,
      });

      const result = (await jobApplicationService.find({ userId: USER_ID })).results;

      expect(result).not.toBeNull();
      expect(result[0].company).toBe('Test company');
      expect(result[0].salaryMax).toBe(2000);
    });
  });

  // TODO: stubs

  afterAll(async () => {
    await database.close();
  });
});
