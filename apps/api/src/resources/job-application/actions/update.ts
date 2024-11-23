import { AppKoaContext, AppRouter } from 'types';

// TODO: CRUD

async function handler(ctx: AppKoaContext) {
  ctx.body = null;
}

export default (router: AppRouter) => {
  router.patch('/:id', handler);
};
