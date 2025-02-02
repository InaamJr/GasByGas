const db = require('../config/db');

const getConsumerDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM consumer WHERE consumer_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Consumer not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching consumer details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getConsumerDetails };
