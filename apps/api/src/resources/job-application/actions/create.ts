import { jobApplicationService } from 'resources/job-application';

import { validateMiddleware } from 'middlewares';

import { createJobApplicationSchema } from 'schemas';
import { AppKoaContext, AppRouter, CreateJobApplicationParams } from 'types';

async function handler(ctx: AppKoaContext<CreateJobApplicationParams>) {
  if (!ctx.state.user?._id) {
    ctx.throw(401, 'Unauthorized');
  }

  const data = ctx.validatedData;
  const userId = ctx.state.user._id;

  // TODO: This validation should be moved to the schema or service, place it here for quick implementation
  if (data.salaryMax < data.salaryMin) {
    ctx.throw(400, { clientErrors: { salary: ['Максимальная зарплата не может быть меньше минимальной'] } });
  }

  const jobApplication = await jobApplicationService.insertOne({ ...data, userId });

  ctx.body = jobApplication;
  ctx.status = 201;
}

export default (router: AppRouter) => {
  router.post('/', validateMiddleware(createJobApplicationSchema), handler);
};
