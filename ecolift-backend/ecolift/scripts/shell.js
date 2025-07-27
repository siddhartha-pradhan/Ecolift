import repl from 'repl';

import config from '../src/utils/config.js';
import app from '../src/app.js';
import mongoInit from '../src/models/init.js';
import User from '../src/models/user.js';
import UserProfile from '../src/models/userprofile.js';
import Ride from '../src/models/ride.js';
import Driver from '../src/models/driver.js';
import Item from '../src/models/item.js';
import RideHistory from '../src/models/ridehistory.js';
import AdminVerification from '../src/models/adminverification.js';
import Advertisment from '../src/models/advertisment.js';
import RedeemPointsHistory from '../src/models/redeempointshistory.js';
import Subscription from '../src/models/subscription.js';
import UserService from '../src/services/user.js';
import UserProfileService from '../src/services/userprofile.js';
import RideService from '../src/services/ride.js';
import DriverService from '../src/services/driver.js';
import RideHistoryService from '../src/services/ridehistory.js';
import AdminVerificationService from '../src/services/adminverification.js';
import AdvertismentService from '../src/services/advertisment.js';
import ItemService from '../src/services/item.js';
import RedeemPointsHistoryService from '../src/services/redeempointshistory.js';
import SubscriptionService from '../src/services/subscription.js';

const main = async () => {
  await mongoInit(config.DATABASE_URL);
  process.stdout.write('Database and Express app initialized.\n');
  process.stdout.write('Auto Imported Modules: config, app, models, services\n');

  const r = repl.start('> ');
  r.context.config = config;
  r.context.app = app;
  r.context.models = {
    User,
    UserProfile,
    Ride,
    Driver,
    Item,
    RideHistory,
    AdminVerification,
    Advertisment,
    RedeemPointsHistory,
    Subscription,
  };
  r.context.services = {
    UserService,
    UserProfileService,
    RideService,
    DriverService,
    ItemService,
    RideHistoryService,
    AdminVerificationService,
    AdvertismentService,
    RedeemPointsHistoryService,
    SubscriptionService,
  };

  r.on('exit', () => {
    process.exit();
  });

  r.setupHistory('.shell_history', () => {});
};

main();