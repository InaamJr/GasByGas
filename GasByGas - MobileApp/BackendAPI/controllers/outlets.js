const db = require('../config/db');

// Fetch all outlets
const getOutlets = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT outlet_id, outlet_name, district FROM outlet WHERE status = "active"');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No outlets found' });
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching outlets:', error);
    res.status(500).json({ error: 'Failed to fetch outlets' });
  }
};

module.exports = { getOutlets };
