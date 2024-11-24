import { jobApplicationService } from 'resources/job-application';

import { AppKoaContext, AppRouter, Next } from 'types';

type ValidatedData = never;
type Request = {
  params: {
    id: string;
  };
};

async function validator(ctx: AppKoaContext<ValidatedData, Request>, next: Next) {
  const userId = ctx.state.user._id;
  const jobApplicationId = ctx.request.params.id;

  const isJobApplicationExists = await jobApplicationService.exists({
    _id: jobApplicationId,
    userId,
  });

  ctx.assertError(isJobApplicationExists, 'Отклик на вакансию не найден');

  await next();
}

async function handler(ctx: AppKoaContext<ValidatedData, Request>) {
  await jobApplicationService.deleteOne({ _id: ctx.request.params.id });

  ctx.status = 204;
}

export default (router: AppRouter) => {
  router.delete('/:id', validator, handler);
};
