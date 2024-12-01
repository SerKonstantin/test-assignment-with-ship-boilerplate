import { jobApplicationService } from 'resources/job-application';

import { JobApplicationStatus } from 'schemas';
import { AppKoaContext, AppRouter } from 'types';

type ValidatedData = never;

async function handler(ctx: AppKoaContext<ValidatedData>) {
  const userId = ctx.state.user._id;

  await jobApplicationService.deleteMany({
    userId,
    status: JobApplicationStatus.REJECTED,
  });

  ctx.status = 204;
}

export default (router: AppRouter) => {
  router.post('/delete-rejected', handler);
};
