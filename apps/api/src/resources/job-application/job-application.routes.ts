import { routeUtil } from 'utils';

import batchDelete from './actions/batch-delete';
import create from './actions/create';
import remove from './actions/delete';
import list from './actions/list';
import update from './actions/update';

const publicRoutes = routeUtil.getRoutes([]);

const privateRoutes = routeUtil.getRoutes([list, create, remove, batchDelete, update]);

// TODO: Admins actions should include target user id
const adminRoutes = routeUtil.getRoutes([list, create, remove, batchDelete, update]);

export default {
  publicRoutes,
  privateRoutes,
  adminRoutes,
};
