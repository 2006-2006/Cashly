const User = require('../models/User');
const Alert = require('../models/Alert');

class BehaviorService {
    /**
     * Updates review streak for the user.
     */
    static async updateStreak(userId) {
        if (!userId) return;
        const user = await User.findById(userId);
        if (!user) return;

        const now = new Date();
        const last = user.lastReviewDate;

        if (!last) {
            user.reviewStreak = 1;
        } else {
            const diffHours = (now - last) / (1000 * 60 * 60);
            if (diffHours < 24) {
                // Already reviewed today, do nothing
                return user.reviewStreak;
            } else if (diffHours < 48) {
                user.reviewStreak += 1;
            } else {
                user.reviewStreak = 1; // Streak broken
            }
        }

        user.lastReviewDate = now;
        await user.save();
        return user.reviewStreak;
    }

    /**
     * Calculates financial discipline score.
     */
    static async getDisciplineScore(userId) {
        if (!userId) return { score: 0, streak: 0, ignoredAlerts: 0, feedback: 'N/A' };
        const user = await User.findById(userId);
        if (!user) return { score: 0, streak: 0, ignoredAlerts: 0, feedback: 'User not found' };

        // Alerts are linked to business. For discipline, we check all businesses the user has?
        // Or just passing businessId? Let's check for all alerts where this user is owner.
        const alerts = await Alert.find({}).lean();
        // Filter alerts manually if needed, or by business. 
        // For now, let's assume we want alerts from the user's primary/last business.

        const ignoredAlerts = alerts.filter(a => !a.isRead && (new Date() - a.createdAt) > (1000 * 60 * 60 * 24 * 3)).length;

        // Base score 100, deduct 5 points per ignored alert
        let score = 100 - (ignoredAlerts * 5);
        score += ((user.reviewStreak || 0) * 2);

        return {
            score: Math.min(100, Math.max(0, score)),
            ignoredAlerts,
            streak: user.reviewStreak || 0,
            feedback: score > 80 ? 'Excellent financial discipline!' : 'Try to review alerts more frequently.'
        };
    }
}

module.exports = BehaviorService;
