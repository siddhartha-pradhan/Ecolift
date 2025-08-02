import { Router } from 'express';

import AdvertisementService from '../../services/advertisement.js';
import { requireUser } from '../middlewares/auth.js';
import { requireSchema, requireValidId } from '../middlewares/validate.js';
import schema from '../schemas/advertisement.js';

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: Advertisement
 *   description: API for managing Advertisement objects
 *
 * /advertisement:
 *   get:
 *     tags: [Advertisement]
 *     summary: Get all the Advertisement objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of Advertisement objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Advertisement'
 */
router.get('', async (req, res, next) => {
  try {
    const results = await AdvertisementService.list();
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
 * /advertisement:
*   post:
 *     tags: [Advertisement]
 *     summary: Create a new Advertisement
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Advertisement'
 *     responses:
 *       201:
 *         description: The created Advertisement object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Advertisement'
 */
router.post('', requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await AdvertisementService.create(req.validatedBody);
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
 * /advertisement/{id}:
 *   get:
 *     tags: [Advertisement]
 *     summary: Get a Advertisement by id
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
 *         description: Advertisement object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Advertisement'
 */
router.get('/:id', requireValidId, async (req, res, next) => {
  try {
    const obj = await AdvertisementService.get(req.params.id);
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
 * /advertisement/{id}:
 *   put:
 *     tags: [Advertisement]
 *     summary: Update Advertisement with the specified id
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
 *             $ref: '#/components/schemas/Advertisement'
 *     responses:
 *       200:
 *         description: The updated Advertisement object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Advertisement'
 */
router.put('/:id', requireValidId, requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await AdvertisementService.update(req.params.id, req.validatedBody);
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
 * /advertisement/{id}:
 *   delete:
 *     tags: [Advertisement]
 *     summary: Delete Advertisement with the specified id
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
    const success = await AdvertisementService.delete(req.params.id);
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