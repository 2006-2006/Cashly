const supabase = require('../config/supabase');

const clearAllUserData = async (req, res) => {
    try {
        const userId = req.user.id;

        const [
            { count: salesCount },
            { count: expCount },
            { count: invCount },
            { count: recCount }
        ] = await Promise.all([
            supabase.from('sales').delete({ count: 'exact' }).eq('user_id', userId),
            supabase.from('expenses').delete({ count: 'exact' }).eq('user_id', userId),
            supabase.from('inventory').delete({ count: 'exact' }).eq('user_id', userId),
            supabase.from('receivables').delete({ count: 'exact' }).eq('user_id', userId)
        ]);

        console.log('Data cleared for user:', userId);

        res.status(200).json({
            message: 'All data cleared successfully',
            deleted: {
                sales: salesCount || 0,
                expenses: expCount || 0,
                inventory: invCount || 0,
                receivables: recCount || 0
            }
        });
    } catch (error) {
        console.error('Clear data error:', error);
        res.status(500).json({ message: 'Failed to clear data', error: error.message });
    }
};

module.exports = { clearAllUserData };
