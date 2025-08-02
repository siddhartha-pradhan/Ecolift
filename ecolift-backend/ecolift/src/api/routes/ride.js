import { Router } from 'express';

import RideService from '../../services/ride.js';
import { requireUser } from '../middlewares/auth.js';
import { requireSchema, requireValidId } from '../middlewares/validate.js';
import schema from '../schemas/ride.js';
import UserProfileService from "../../services/userprofile.js";
import UserService from "../../services/user.js";

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: Ride
 *   description: API for managing Ride objects
 *
 * /ride:
 *   get:
 *     tags: [Ride]
 *     summary: Get all the Ride objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of Ride objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ride'
 */
router.get('', async (req, res, next) => {
  try {
    const results = await RideService.list();
    res.json(results);
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const results = await RideService.listByUser(userId);
    res.json(results);
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});


router.get('/driver/:driverUserId', async (req, res, next) => {
  try {
    const driverUserId = req.params.driverUserId;
    const results = await RideService.listByDriver(driverUserId);
    res.json(results);
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

/** @swagger
 *
 * /ride:
*   post:
 *     tags: [Ride]
 *     summary: Create a new Ride
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ride'
 *     responses:
 *       201:
 *         description: The created Ride object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
 */
router.post('', async (req, res, next) => {
  try {
    const userProfile = await UserProfileService.getByUser(req.body.user)
    if(userProfile === null)
    {
      res.status(404).json("USer not found")
    }
    req.body = {
      ...req.body,
      userProfile: userProfile._id
    }
    const obj = await RideService.create(req.body);
    const updatedFreeRides = Math.max((userProfile.freeRidesRemaining || 0) - 1, 0);
    await UserProfileService.update(userProfile._id, {
      freeRidesRemaining: updatedFreeRides,
    });
    res.status(201).json(obj);
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

/** @swagger
 *
 * /ride/{id}:
 *   get:
 *     tags: [Ride]
 *     summary: Get a Ride by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
 */
router.get('/:id', requireValidId, async (req, res, next) => {
  try {
    const obj = await RideService.get(req.params.id);
    if (obj) {
      res.json(obj);
    } else {
      res.status(404).json({ error: 'Resource not found' });
    }
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

/** @swagger
 *
 * /ride/{id}:
 *   put:
 *     tags: [Ride]
 *     summary: Update Ride with the specified id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ride'
 *     responses:
 *       200:
 *         description: The updated Ride object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
 */
router.put('/:id', requireValidId, requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await RideService.update(req.params.id, req.validatedBody);
    if (obj) {
      res.status(200).json(obj);
    } else {
      res.status(404).json({ error: 'Resource not found' });
    }
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

/** @swagger
 *
 * /ride/{id}:
 *   delete:
 *     tags: [Ride]
 *     summary: Delete Ride with the specified id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *        description: OK, object deleted
 */
router.delete('/:id', requireValidId, async (req, res, next) => {
  try {
    const success = await RideService.delete(req.params.id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Not found, nothing deleted' });
    }
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

router.post('/:id/accept', async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const driverUserId = req.body.driverUserId;
    await RideService.accept(rideId, driverUserId);
    res.status(200).json({"message":"RIde accepted successfully"});
  } catch (err) {
    next(err);
}
});

router.post('/:id/request', async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const driverId = req.body.driverId;
    await RideService.requestRide(rideId, driverId);ex
    res.status(200).json({"message":"RIde requested successfully"});
  } catch (err) {
    next(err);
  }
});

router.put('/:id/cancel', async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const driverUserId = req.body.driverUserId;
    const updated = await RideService.cancel(rideId, driverUserId);
    if (!updated) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/complete', async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const driverUserId = req.body.driverUserId;
    const updated = await RideService.complete(rideId, driverUserId);
    if (!updated) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({"error":err.toString()})
    next(err);
  }
});

router.post('all-cancel', async (req, res, next) => {
  try {
    const userId = req.body.id;
    const updated = await RideService.cancelAllByUser(userId);
    if (!updated) {
      return res.status(404).json({ message: 'user not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});


router.post('/:id/ignore', async (req, res, next) => {
  try {
    const rideId = req.params.id
    const driverUserId = req.body.driverUserId;
    const updated = await RideService.ignoreRide(rideId, driverUserId);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

router.get('/ignore/driver/:id', async (req, res, next) => {
  try {
    const driverUserId = req.params.id
    const updated = await RideService.getIgnoredRides(driverUserId);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});


/**
 * @swagger
 * /ride/{id}/status:
 *   post:
 *     tags: [Ride]
 *     summary: Update status of a ride (e.g. started, reached)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ride ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newStatus
 *               - driverUserId
 *             properties:
 *               newStatus:
 *                 type: string
 *                 enum: [started, reached]
 *               driverUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ride status updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Ride not found or invalid status
 */
router.post('/:id/status', async (req, res, next) => {
  try {
    const { newStatus } = req.body;
    const rideId = req.params.id;

    const updated = await RideService.updateRideStatus(rideId, newStatus);
    if (!updated) {
      return res.status(404).json({ message: "Ride not found or update failed." });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update status." });
    next(err);
  }
});


export default router;