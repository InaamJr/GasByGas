const db = require('../config/db');

// Fetch all cylinder types
const getCylinderTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT type_id, name, description, weight_kg, price FROM cylinder_types');
    console.log('Fetched Cylinder Types:', rows); // Log the query result
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No cylinder types found' });
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching cylinder types:', error);
    res.status(500).json({ error: 'Failed to fetch cylinder types' });
  }
};

module.exports = { getCylinderTypes };
