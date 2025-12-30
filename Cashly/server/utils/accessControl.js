const supabase = require('../config/supabase');

const checkBusinessAccess = async (user, businessId, dbClient = supabase) => {
    if (!businessId) throw new Error('Business ID is required');

    const { data: business, error } = await dbClient
        .from('businesses')
        .select('user_id')
        .eq('id', businessId)
        .maybeSingle();

    if (error) throw error;
    if (!business) {
        throw new Error('Business not found');
    }

    // Check if user is owner
    // Note: If you have a 'business_users' table for sharing, check that too.
    // For now assuming 1:1 ownership based on schema seen so far.
    const isOwner = business.user_id === user.id;

    if (!isOwner) {
        // Fallback: check if we have a members mechanism in future
        throw new Error('Not authorized to access this business');
    }
    return true;
};

module.exports = { checkBusinessAccess };
