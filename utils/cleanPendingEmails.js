// Utility to clean up expired pending emails
const cron = require("node-cron");
const User = require("../models/User");

// Run cleanup every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await User.updateMany(
      { pendingEmailExpires: { $lt: new Date() } },
      { $unset: { pendingEmail: "", pendingEmailExpires: "" } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Cleanup] Removed ${result.modifiedCount} expired pending emails`);
    }
  } catch (err) {
    console.error("[Cleanup Error]", err.message);
  }
});
