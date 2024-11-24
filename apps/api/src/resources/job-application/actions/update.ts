import { jobApplicationService } from 'resources/job-application';

import { validateMiddleware } from 'middlewares';

import { updateJobApplicationSchema } from 'schemas';
import { AppKoaContext, AppRouter, Next, UpdateJobApplicationParams } from 'types';

type Request = {
  params: {
    id: string;
  };
};

async function validator(ctx: AppKoaContext<UpdateJobApplicationParams, Request>, next: Next) {
  const userId = ctx.state.user._id;
  const jobApplicationId = ctx.request.params.id;

  const jobApplication = await jobApplicationService.findOne({
    _id: jobApplicationId,
    userId,
  });

  ctx.assertError(jobApplication, 'Отклик на вакансию не найден');

  if (ctx.validatedData.salaryMin !== undefined && ctx.validatedData.salaryMax !== undefined) {
    ctx.assertClientError(ctx.validatedData.salaryMax >= ctx.validatedData.salaryMin, {
      salaryMax: 'Максимальная зарплата не может быть меньше минимальной',
    });
  }

  await next();
}

async function handler(ctx: AppKoaContext<UpdateJobApplicationParams, Request>) {
  const jobApplicationId = ctx.request.params.id;
  const updateData = ctx.validatedData;

  const updatedJobApplication = await jobApplicationService.updateOne({ _id: jobApplicationId }, () => updateData);

  ctx.body = updatedJobApplication;
}

export default (router: AppRouter) => {
  router.patch('/:id', validateMiddleware(updateJobApplicationSchema), validator, handler);
};
