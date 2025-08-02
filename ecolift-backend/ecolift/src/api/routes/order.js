import { Router } from 'express';
import { requireUser } from '../middlewares/auth.js';
import { requireValidId } from '../middlewares/validate.js';
import OrderService from '../../services/order.js';

const router = Router();
const orderService = new OrderService();

router.use(requireUser);

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: API for managing orders
 */

/**
 * @swagger
 * /order:
 *   get:
 *     tags: [Order]
 *     summary: Get all orders (admin)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', async (req, res, next) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /order/user:
 *   get:
 *     tags: [Order]
 *     summary: Get current user's orders
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User-specific order list
 */
router.get('/user', async (req, res, next) => {
    try {
        const orders = await orderService.getOrdersByUser(req.user.id);
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /order:
 *   post:
 *     tags: [Order]
 *     summary: Create a new order
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderDetails]
 *             properties:
 *               orderDetails:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [itemId, quantity]
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', async (req, res, next) => {
    try {
        const order = await orderService.createOrder({
            userId: req.user.id,
            orderDetails: req.body.orderDetails,
        });
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /order/{id}:
 *   get:
 *     tags: [Order]
 *     summary: Get an order by ID
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
 *         description: The order object
 */
router.get('/:id', requireValidId, async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /order/claim/{code}:
 *   post:
 *     tags: [Order]
 *     summary: Mark an order as claimed using claim code
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order claimed successfully
 */
router.post('/claim/:code', async (req, res, next) => {
    try {
        const updated = await orderService.markOrderAsClaimed(req.params.code);
        res.json({ message: 'Order claimed', data: updated });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /order/claim/{code}:
 *   get:
 *     tags: [Order]
 *     summary: Get an order by claim code
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The order object
 */
router.get('/claim/:code', async (req, res, next) => {
    try {
        const order = await orderService.getOrderByClaimCode(req.params.code);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Invalid claim code' });
        }
    } catch (error) {
        next(error);
    }
});

export default router;
