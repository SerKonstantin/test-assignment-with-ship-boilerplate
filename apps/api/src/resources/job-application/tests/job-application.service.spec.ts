import { Database } from '@paralect/node-mongo';

import { jobApplicationSchema, JobApplicationStatus } from 'schemas';
import { JobApplication } from 'types';

const database = new Database(process.env.MONGO_URL as string);
const jobApplicationService = database.createService<JobApplication>('job-applications', {
  schemaValidator: (obj) => jobApplicationSchema.parseAsync(obj),
});

describe('Job application Unit Tests', () => {
  const USER_ID = 'user_id';

  const testData = {
    _id: 'job_application_id',
    company: 'Test company',
    position: 'Test position',
    salaryMin: 1000,
    salaryMax: 2000,
    status: JobApplicationStatus.APPLIED,
    notes: 'Test notes',
    userId: USER_ID,
  };

  beforeAll(async () => {
    await database.connect();
  });

  beforeEach(async () => {
    await jobApplicationService.deleteMany({});
  });

  describe('validate schema', () => {
    test.each([{ company: 'ab' }, { position: 'a' }, { salaryMin: -1 }, { salaryMax: -1 }])(
      'should fail',
      async (invalidData) => {
        await expect(jobApplicationService.insertOne({ ...testData, ...invalidData })).rejects.toThrow();
      },
    );
  });

  describe('create job application', () => {
    it('should create job application', async () => {
      await jobApplicationService.insertOne(testData);

      const result = await jobApplicationService.findOne({ _id: testData._id });

      expect(result).not.toBeNull();
      expect(result?.position).toBe(testData.position);
      expect(result?.salaryMin).toBe(testData.salaryMin);
      expect(result?.status).toBe(testData.status);
    });
  });

  describe('read job application', () => {
    it('should return job applications list', async () => {
      await jobApplicationService.insertMany([
        {
          _id: 'test 1',
          company: 'Test company 1',
          position: 'Test position 1',
          salaryMin: 1000,
          salaryMax: 2000,
          status: JobApplicationStatus.APPLIED,
          userId: USER_ID,
        },
        {
          _id: 'test 2',
          company: 'Test company 2',
          position: 'Test position 2',
          salaryMin: 500,
          salaryMax: 900,
          status: JobApplicationStatus.INTERVIEW,
          userId: USER_ID,
        },
      ]);

      const result = (await jobApplicationService.find({ userId: USER_ID })).results;

      expect(result).not.toBeNull();
      expect(result[0].company).toBe('Test company 1');
      expect(result[1].company).toBe('Test company 2');
      expect(result[0].status).toBe(JobApplicationStatus.APPLIED);
      expect(result[1].status).toBe(JobApplicationStatus.INTERVIEW);
    });
  });

  describe('update job application', () => {
    type TestDataKeys = keyof typeof testData;
    // Exclude timestamp fields
    const fieldsToCompare: TestDataKeys[] = [
      'company',
      'position',
      'salaryMin',
      'salaryMax',
      'status',
      'notes',
      'userId',
      '_id',
    ];

    beforeEach(async () => {
      await jobApplicationService.insertOne(testData);
    });

    test.each<{ field: TestDataKeys; value: JobApplication[TestDataKeys] }>([
      { field: 'company', value: 'Updated company' },
      { field: 'position', value: 'Updated position' },
      { field: 'salaryMin', value: 1100 },
      { field: 'salaryMax', value: 1900 },
      { field: 'status', value: JobApplicationStatus.OFFER },
      { field: 'notes', value: 'Updated notes' },
    ])('should update $field', async ({ field, value }) => {
      const updateData = { [field]: value };

      await jobApplicationService.updateOne({ _id: testData._id }, () => updateData);

      const result = await jobApplicationService.findOne({ _id: testData._id });

      expect(result).not.toBeNull();
      expect(result?.[field]).toBe(value);

      // Check other fields remained unchanged
      fieldsToCompare.forEach((key) => {
        if (key !== field) {
          expect(result?.[key]).toBe(testData[key]);
        }
      });
    });

    it('should update multiple fields', async () => {
      const updateData = {
        company: 'Multi Update Company',
        position: 'Multi Update Position',
        status: JobApplicationStatus.REJECTED,
      };

      await jobApplicationService.updateOne({ _id: testData._id }, () => updateData);

      const result = await jobApplicationService.findOne({ _id: testData._id });

      expect(result).not.toBeNull();
      expect(result?.company).toBe(updateData.company);
      expect(result?.position).toBe(updateData.position);
      expect(result?.status).toBe(updateData.status);
      expect(result?.salaryMin).toBe(testData.salaryMin); // Unchanged
      expect(result?.salaryMax).toBe(testData.salaryMax);
      expect(result?.notes).toBe(testData.notes);
    });
  });

  afterAll(async () => {
    await database.close();
  });
});
