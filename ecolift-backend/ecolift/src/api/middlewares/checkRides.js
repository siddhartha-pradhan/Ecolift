import UserProfile from "../../models/userprofile.js";

export async function checkFreeRides(req, res, next) {
  try {
    const userProfile = await UserProfile.findOne({ user: req.user._id });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    if (userProfile.freeRidesRemaining <= 0) {
      return res.status(403).json({ error: "No free rides left" });
    }

    // Deduct 1 from freeRidesRemaining
    // userProfile.freeRidesRemaining -= 1;
    await userProfile.save();

    next();
  } catch (error) {
    console.error("Error checking free rides:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
