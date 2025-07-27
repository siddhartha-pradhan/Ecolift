import { Router } from 'express';

import DriverService from '../../services/driver.js';
import { requireUser } from '../middlewares/auth.js';
import { requireSchema, requireValidId } from '../middlewares/validate.js';
import schema from '../schemas/driver.js';
import upload from "../middlewares/upload.js";

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: Driver
 *   description: API for managing Driver objects
 *
 * /driver:
 *   get:
 *     tags: [Driver]
 *     summary: Get all the Driver objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of Driver objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Driver'
 */
router.get('', async (req, res, next) => {
  try {
    const results = await DriverService.list();
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
 * /driver:
*   post:
 *     tags: [Driver]
 *     summary: Create a new Driver
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Driver'
 *     responses:
 *       201:
 *         description: The created Driver object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 */
router.post(
    '',
    upload.fields([
      { name: 'licenseImage', maxCount: 1 },
      { name: 'bluebookImage', maxCount: 1 },
    ]),
    async (req, res, next) => {
      try {
        const { body, files } = req;

        if (!body.user || !body.vehicleDetails || !files.licenseImage || !files.bluebookImage) {
          return res.status(400).json({ error: 'Missing required fields or files.' });
        }

        const driverData = {
          user: body.user,
          vehicleDetails: body.vehicleDetails,
          licenseImage: files.licenseImage[0].path,
          bluebookImage: files.bluebookImage[0].path,
          isVerified: false,
        };

        const createdDriver = await DriverService.create(driverData);
        res.status(201).json(createdDriver);
      } catch (error) {
        console.error(error);
        next(error);
      }
    }
);

/** @swagger
 *
 * /driver/{id}:
 *   get:
 *     tags: [Driver]
 *     summary: Get a Driver by id
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
 *         description: Driver object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 */
router.get('/:id', requireValidId, async (req, res, next) => {
  try {
    const obj = await DriverService.get(req.params.id);
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
 * /driver/{id}:
 *   put:
 *     tags: [Driver]
 *     summary: Update Driver with the specified id
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
 *             $ref: '#/components/schemas/Driver'
 *     responses:
 *       200:
 *         description: The updated Driver object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 */
router.put('/:id', requireValidId, requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await DriverService.update(req.params.id, req.validatedBody);
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
 * /driver/{id}:
 *   delete:
 *     tags: [Driver]
 *     summary: Delete Driver with the specified id
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
    const success = await DriverService.delete(req.params.id);
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

router.post('/vehicle', requireValidId, async (req, res, next) => {
  try {
    const success = await DriverService.delete(req.params.id);
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

export default router;