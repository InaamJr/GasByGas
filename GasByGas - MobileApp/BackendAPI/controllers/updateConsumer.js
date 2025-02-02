const db = require('../config/db');


const updateConsumer = async (req, res) => {
  const { consumer_id, name, email, contact_no } = req.body;

  if (!consumer_id || !name || !email || !contact_no) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await db.query(
      `UPDATE consumer 
       SET name = ?, email = ?, contact_no = ?
       WHERE consumer_id = ?`,
      [name, email, contact_no, consumer_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Consumer not found" });
    }

    res.status(200).json({ message: "Consumer updated successfully" });
  } catch (error) {
    console.error("Error updating consumer:", error);
    res.status(500).json({ error: "Failed to update consumer" });
  }
};

module.exports = { updateConsumer };
