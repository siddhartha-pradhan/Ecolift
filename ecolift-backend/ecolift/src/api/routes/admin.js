import { Router } from "express";

import UserService from "../../services/user.js";
import urls from "../urls.js";
import { requireUser } from "../middlewares/auth.js";
import { requireSchema } from "../middlewares/validate.js";
import {
  registerSchema,
  changePasswordSchema,
  loginSchema,
  verifySchema,
} from "../schemas/auth.js";
import UserProfileService from "../../services/userprofile.js";

const router = Router();

router.use(requireUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get list of all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   name:
 *                     type: string
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

router.get("", requireUser, async (req, res) => {
  // Check if current user is Admin

  try {
    const users = await UserService.getAllUsersBasicInfo();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/:id", requireUser, async (req, res) => {
  // Check if current user is Admin
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    const userProfile = await UserProfileService.getByUser(req.params.id);
    if (userProfile === null) {
      res.json(404).json({ error: "User profile not found" });
    }
    const updateOne = req.body;
    const users = await UserProfileService.update(userProfile._id, updateOne);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
