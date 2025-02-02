const bcrypt = require('bcrypt');
const db = require('./config/db');

const hashExistingPasswords = async () => {
  try {
    // Update general_consumer passwords
    const [generalConsumers] = await db.query('SELECT general_consumer_id, password FROM general_consumer');
    for (const consumer of generalConsumers) {
      const hashedPassword = await bcrypt.hash(consumer.password, 10);
      await db.query('UPDATE general_consumer SET password = ? WHERE general_consumer_id = ?', [hashedPassword, consumer.general_consumer_id]);
    }

    // Update business_consumer passwords
    const [businessConsumers] = await db.query('SELECT business_consumer_id, password FROM business_consumer');
    for (const consumer of businessConsumers) {
      const hashedPassword = await bcrypt.hash(consumer.password, 10);
      await db.query('UPDATE business_consumer SET password = ? WHERE business_consumer_id = ?', [hashedPassword, consumer.business_consumer_id]);
    }

    console.log('All passwords updated successfully!');
    db.end();
  } catch (error) {
    console.error('Error updating passwords:', error);
  }
};

hashExistingPasswords();
