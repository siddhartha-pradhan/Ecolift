import cron from 'node-cron';
import UserProfile from '../src/models/userprofile.js';

// Run this task every day at midnight (12 AM)
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('⏳ Resetting free rides for all users...');

    await UserProfile.updateMany(
      {},
      [
        {
          $set: {
            freeRidesRemaining: {
              $cond: {
                if: '$isPremium',
                then: 3,
                else: 1,
              },
            },
          },
        },
      ]
    );

    console.log('✅ Free rides reset successfully!');
  } catch (error) {
    console.error('❌ Error resetting free rides:', error);
  }
});
