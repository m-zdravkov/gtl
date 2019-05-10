const appPackage = require('../../../package.json');
import { constants } from '../../components/constants';
import { Request, Response, Router, Application} from 'express';
import { userHandler } from './UserResources';

export function initializeResources(app: Application, router: Router): void {
  // Define our routes to start with a base route defined in constants
  app.use(constants.router.baseRoute, router);

  // Status route used to display API name and version
  router.get('/api', function (req: Request, res: Response): void {
    const message = {
      API: appPackage.description,
      version: appPackage.version,
      author: appPackage.author
    };
    res.send(message);
  });

  router.get('/easterEgg', function (req: Request, res: Response): void {
    res.sendStatus(418);
  });

  // Require routes related to different models
  require('./BookResources')(router);
  require('./WishlistResources')(router);
  userHandler(router);
}
