import { Router } from 'express';

import SubscriptionService from '../../services/subscription.js';
import { requireUser } from '../middlewares/auth.js';
import { requireSchema, requireValidId } from '../middlewares/validate.js';
import schema from '../schemas/subscription.js';

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: Subscription
 *   description: API for managing Subscription objects
 *
 * /subscription:
 *   get:
 *     tags: [Subscription]
 *     summary: Get all the Subscription objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of Subscription objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 */
router.get('', async (req, res, next) => {
  try {
    const results = await SubscriptionService.list();
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
 * /subscription:
*   post:
 *     tags: [Subscription]
 *     summary: Create a new Subscription
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subscription'
 *     responses:
 *       201:
 *         description: The created Subscription object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 */
router.post('', requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await SubscriptionService.create(req.validatedBody);
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
 * /subscription/{id}:
 *   get:
 *     tags: [Subscription]
 *     summary: Get a Subscription by id
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
 *         description: Subscription object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 */
router.get('/:id', requireValidId, async (req, res, next) => {
  try {
    const obj = await SubscriptionService.get(req.params.id);
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
 * /subscription/{id}:
 *   put:
 *     tags: [Subscription]
 *     summary: Update Subscription with the specified id
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
 *             $ref: '#/components/schemas/Subscription'
 *     responses:
 *       200:
 *         description: The updated Subscription object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 */
router.put('/:id', requireValidId, requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await SubscriptionService.update(req.params.id, req.validatedBody);
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
 * /subscription/{id}:
 *   delete:
 *     tags: [Subscription]
 *     summary: Delete Subscription with the specified id
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
    const success = await SubscriptionService.delete(req.params.id);
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