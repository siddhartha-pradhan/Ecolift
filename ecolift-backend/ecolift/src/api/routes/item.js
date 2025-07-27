import { Router } from 'express';

import ItemService from '../../services/item.js';
import { requireUser } from '../middlewares/auth.js';
import { requireSchema, requireValidId } from '../middlewares/validate.js';
import schema from '../schemas/item.js';

const router = Router();

router.use(requireUser);

/**
 * @swagger
 * tags:
 *   name: Item
 *   description: API for managing items
 */

/**
 * @swagger
 * /item:
 *   get:
 *     tags: [Item]
 *     summary: Get all items
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get('', async (req, res, next) => {
    try {
        const results = await ItemService.list();
        res.json(results);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /item:
 *   post:
 *     tags: [Item]
 *     summary: Create a new item
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: The created item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 */
router.post('', requireSchema(schema), async (req, res, next) => {
    try {
        const item = await ItemService.create(req.validatedBody);
        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /item/{id}:
 *   get:
 *     tags: [Item]
 *     summary: Get an item by id
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
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 */
router.get('/:id', requireValidId, async (req, res, next) => {
    try {
        const item = await ItemService.get(req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /item/{id}:
 *   put:
 *     tags: [Item]
 *     summary: Update an item
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
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Updated item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 */
router.put('/:id', requireValidId, requireSchema(schema), async (req, res, next) => {
    try {
        const item = await ItemService.update(req.params.id, req.validatedBody);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /item/{id}:
 *   delete:
 *     tags: [Item]
 *     summary: Delete an item
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
 *         description: Item deleted
 */
router.delete('/:id', requireValidId, async (req, res, next) => {
    try {
        const success = await ItemService.delete(req.params.id);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * tags:
 *   name: UserProfile
 *   description: Manage user profile data
 */

/**
 * @swagger
 * /redeem:
 *   post:
 *     tags: [UserProfile]
 *     summary: Deduct redeem points from user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Points successfully deducted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Bad request or insufficient points
 */
router.post('/redeem', async (req, res, next) => {
    const { userId, amount } = req.body;

    try {
        const result = await ItemService.reduceRedeemPoints(userId, amount);
        res.status(200).json({
            message: 'Redeem points deducted',
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
