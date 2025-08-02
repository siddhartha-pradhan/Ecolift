import cron from 'node-cron';
import Ride, {RIDE_STATUSES} from '../src/models/ride.js';

const NEPAL_OFFSET_MINUTES = 345;

function getNepalTimeNow() {
    return new Date(Date.now() + NEPAL_OFFSET_MINUTES * 60 * 1000);
}

cron.schedule('* * * * *', async () => {
    const nowNepal = getNepalTimeNow();
    const normalExpiryTime = new Date(nowNepal.getTime() - 10 * 60 * 1000);

    try {
        const expiredNormalRides = await Ride.find({
            status: RIDE_STATUSES.REQUESTED,
            isPreBooked: false,
            createdAt: { $lt: normalExpiryTime },
        });

        for (const ride of expiredNormalRides) {
            console.log(`Auto-cancelling normal ride ${ride._id} with time ${ride.createdAt}`);
            ride.status = RIDE_STATUSES.CANCELED;
        }
    } catch (error) {
        console.error('Error auto-cancelling rides:', error);
    }
});
