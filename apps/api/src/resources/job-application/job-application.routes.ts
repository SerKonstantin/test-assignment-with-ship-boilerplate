import { routeUtil } from 'utils';

import create from './actions/create';
import remove from './actions/delete';
import list from './actions/list';
import update from './actions/update';

const publicRoutes = routeUtil.getRoutes([]);

const privateRoutes = routeUtil.getRoutes([list, create, remove, update]);

const adminRoutes = routeUtil.getRoutes([list, create, remove, update]);

export default {
  publicRoutes,
  privateRoutes,
  adminRoutes,
};
