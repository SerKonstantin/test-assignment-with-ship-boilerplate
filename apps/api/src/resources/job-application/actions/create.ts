import { jobApplicationService } from 'resources/job-application';

import { validateMiddleware } from 'middlewares';

import { createJobApplicationSchema } from 'schemas';
import { AppKoaContext, AppRouter, CreateJobApplicationParams, Next } from 'types';

async function validator(ctx: AppKoaContext<CreateJobApplicationParams>, next: Next) {
  if (!ctx.state.user?._id) {
    ctx.throw(401, 'Unauthorized');
  }

  if (ctx.validatedData.salaryMax < ctx.validatedData.salaryMin) {
    ctx.assertClientError(false, {
      global: 'Максимальная зарплата не может быть меньше минимальной',
    });
  }

  await next();
}

async function handler(ctx: AppKoaContext<CreateJobApplicationParams>) {
  const data = ctx.validatedData;
  const userId = ctx.state.user._id;

  const jobApplication = await jobApplicationService.insertOne({ ...data, userId });

  ctx.body = jobApplication;
  ctx.status = 201;
}

export default (router: AppRouter) => {
  router.post('/', validateMiddleware(createJobApplicationSchema), validator, handler);
};
