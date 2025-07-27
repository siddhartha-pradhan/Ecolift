import { Router } from 'express';

import AdminVerificationService from '../../services/adminverification.js';
import { requireUser } from '../middlewares/auth.js';
import { requireSchema, requireValidId } from '../middlewares/validate.js';
import schema from '../schemas/adminverification.js';

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: AdminVerification
 *   description: API for managing AdminVerification objects
 *
 * /admin-verification:
 *   get:
 *     tags: [AdminVerification]
 *     summary: Get all the AdminVerification objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of AdminVerification objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminVerification'
 */
router.get('', async (req, res, next) => {
  try {
    const results = await AdminVerificationService.list();
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
 * /admin-verification:
*   post:
 *     tags: [AdminVerification]
 *     summary: Create a new AdminVerification
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminVerification'
 *     responses:
 *       201:
 *         description: The created AdminVerification object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminVerification'
 */
router.post('', requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await AdminVerificationService.create(req.validatedBody);
    if(req.body.status == "Rejected")
    {
      await AdminVerificationService.sendRejectionEmail(req.body.driver);
    }
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
 * /admin-verification/{id}:
 *   get:
 *     tags: [AdminVerification]
 *     summary: Get a AdminVerification by id
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
 *         description: AdminVerification object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminVerification'
 */
router.get('/:id', requireValidId, async (req, res, next) => {
  try {
    const obj = await AdminVerificationService.get(req.params.id);
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
 * /admin-verification/{id}:
 *   put:
 *     tags: [AdminVerification]
 *     summary: Update AdminVerification with the specified id
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
 *             $ref: '#/components/schemas/AdminVerification'
 *     responses:
 *       200:
 *         description: The updated AdminVerification object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminVerification'
 */
router.put('/:id', requireValidId, requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await AdminVerificationService.update(req.params.id, req.validatedBody);
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
 * /admin-verification/{id}:
 *   delete:
 *     tags: [AdminVerification]
 *     summary: Delete AdminVerification with the specified id
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
    const success = await AdminVerificationService.delete(req.params.id);
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