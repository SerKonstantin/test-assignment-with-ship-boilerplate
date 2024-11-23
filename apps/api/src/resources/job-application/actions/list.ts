import { Filter } from '@paralect/node-mongo';
import { z } from 'zod';

import { jobApplicationService } from 'resources/job-application';

import { validateMiddleware } from 'middlewares';
import { stringUtil } from 'utils';

import { AppKoaContext, AppRouter, JobApplication, NestedKeys } from 'types';

const schema = z.object({
  searchValue: z.string().optional(),
  sort: z.object({
    company: z.enum(['asc', 'desc']).optional(),
    position: z.enum(['asc', 'desc']).optional(),
    createdOn: z.enum(['asc', 'desc']).default('asc'),
  }),
});

type ValidatedData = z.infer<typeof schema>;

async function handler(ctx: AppKoaContext<ValidatedData>) {
  const { searchValue, sort } = ctx.validatedData;
  const userId = ctx.state.user._id;

  const filterOptions: Filter<JobApplication>[] = [{ userId }];

  if (searchValue) {
    const searchPattern = stringUtil.escapeRegExpString(searchValue);
    const searchFields: NestedKeys<JobApplication>[] = ['company', 'position', 'notes'];

    filterOptions.push({
      $or: searchFields.map((field) => ({ [field]: { $regex: searchPattern } })),
    });
  }

  const applications = await jobApplicationService.find(
    {
      $and: filterOptions,
    },
    {}, // No pagination for kanban-like board
    { sort },
  );

  ctx.body = applications;
}

export default (router: AppRouter) => {
  router.get('/', validateMiddleware(schema), handler);
};
