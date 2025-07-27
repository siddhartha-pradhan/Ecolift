import { Router } from 'express';

import RedeemPointsHistoryService from '../../services/redeempointshistory.js';
import { requireUser } from '../middlewares/auth.js';
import { requireSchema, requireValidId } from '../middlewares/validate.js';
import schema from '../schemas/redeempointshistory.js';

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: RedeemPointsHistory
 *   description: API for managing RedeemPointsHistory objects
 *
 * /redeem-points-history:
 *   get:
 *     tags: [RedeemPointsHistory]
 *     summary: Get all the RedeemPointsHistory objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of RedeemPointsHistory objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RedeemPointsHistory'
 */
router.get('', async (req, res, next) => {
  try {
    const results = await RedeemPointsHistoryService.list();
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
 * /redeem-points-history:
*   post:
 *     tags: [RedeemPointsHistory]
 *     summary: Create a new RedeemPointsHistory
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RedeemPointsHistory'
 *     responses:
 *       201:
 *         description: The created RedeemPointsHistory object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RedeemPointsHistory'
 */
router.post('', requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await RedeemPointsHistoryService.create(req.validatedBody);
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
 * /redeem-points-history/{id}:
 *   get:
 *     tags: [RedeemPointsHistory]
 *     summary: Get a RedeemPointsHistory by id
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
 *         description: RedeemPointsHistory object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RedeemPointsHistory'
 */
router.get('/:id', requireValidId, async (req, res, next) => {
  try {
    const obj = await RedeemPointsHistoryService.get(req.params.id);
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
 * /redeem-points-history/{id}:
 *   put:
 *     tags: [RedeemPointsHistory]
 *     summary: Update RedeemPointsHistory with the specified id
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
 *             $ref: '#/components/schemas/RedeemPointsHistory'
 *     responses:
 *       200:
 *         description: The updated RedeemPointsHistory object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RedeemPointsHistory'
 */
router.put('/:id', requireValidId, requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await RedeemPointsHistoryService.update(req.params.id, req.validatedBody);
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
 * /redeem-points-history/{id}:
 *   delete:
 *     tags: [RedeemPointsHistory]
 *     summary: Delete RedeemPointsHistory with the specified id
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
    const success = await RedeemPointsHistoryService.delete(req.params.id);
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