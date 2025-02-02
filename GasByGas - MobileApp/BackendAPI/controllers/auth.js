const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');


const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};


const db = require('../config/db');

const signupGeneralConsumer = async (req, res) => {
  const { name, nic, email, contact, username, password } = req.body;

  if (!name || !nic || !email || !contact || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Begin transaction
    const conn = await db.getConnection();
    await conn.beginTransaction();

    // Insert into `consumer` table
    const [consumerResult] = await conn.query(
      'INSERT INTO consumer (name, nic, email, contact_no, consumer_type, joined_date, status) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
      [name, nic, email, contact, 'general', 'active']
    );

    const consumerId = consumerResult.insertId;

    // Insert into `general_consumer` table
    await conn.query(
      'INSERT INTO general_consumer (general_consumer_id, username, password) VALUES (?, ?, ?)',
      [consumerId, username, hashedPassword]
    );

    // Commit transaction
    await conn.commit();
    conn.release();

    res.status(201).json({ message: 'General consumer registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};


const signupBusinessConsumer = async (req, res) => {
  const { business_name, business_reg_no, nic, email, contact, username, password } = req.body;
  let certification_document = null;

  // Read the uploaded file as binary data
  if (req.file) {
    certification_document = fs.readFileSync(req.file.path);
  }

  if (!business_name || !business_reg_no || !nic || !email || !contact || !username || !password || !certification_document) {
    return res.status(400).json({ error: 'All fields are required, including certification_document' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Begin transaction
    const conn = await db.getConnection();
    await conn.beginTransaction();

    const [consumerResult] = await conn.query(
      'INSERT INTO consumer (name, nic, email, contact_no, consumer_type, joined_date, status) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
      [business_name, nic, email, contact, 'business', 'active']
    );

    const consumerId = consumerResult.insertId;

    await conn.query(
      'INSERT INTO business_consumer (business_consumer_id, business_name, business_reg_no, certification_document, username, password, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [consumerId, business_name, business_reg_no, certification_document, username, hashedPassword, 'pending']
    );

    await conn.commit();
    conn.release();

    res.status(201).json({ message: 'Business Consumer Registration Request Sent Successfully!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

const loginConsumer = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Fetch consumer by username
    const [rows] = await db.query(
      `SELECT 
         gc.general_consumer_id AS consumer_id, 
         gc.username, 
         gc.password, 
         c.name AS consumer_name,  -- Add consumer name
         'general' AS consumer_type, 
         NULL AS verification_status
       FROM general_consumer gc
       JOIN consumer c ON gc.general_consumer_id = c.consumer_id
       WHERE gc.username = ? 
       UNION 
       SELECT 
         bc.business_consumer_id AS consumer_id, 
         bc.username, 
         bc.password, 
         c.name AS consumer_name,  -- Add consumer name
         'business' AS consumer_type, 
         bc.verification_status
       FROM business_consumer bc
       JOIN consumer c ON bc.business_consumer_id = c.consumer_id
       WHERE bc.username = ?`,
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const consumer = rows[0];

    // Check verification status for business consumers
    if (consumer.consumer_type === 'business') {
      if (consumer.verification_status === 'pending') {
        return res.status(403).json({ error: 'Your account is still under review. Please wait for admin approval.' });
      }
      if (consumer.verification_status === 'rejected') {
        return res.status(403).json({ error: 'Your account registration was rejected. Please contact support for more information.' });
      }
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, consumer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: consumer.consumer_id, type: consumer.consumer_type },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send success response with consumer_name
    res.status(200).json({
      message: 'Login successful',
      token,
      consumer_name: consumer.consumer_name, // Include consumer's name in the response
      consumer_id: consumer.consumer_id, // Include consumer_id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const resetPassword = async (req, res) => {
  const { identifier, newPassword } = req.body; // Identifier can be username or email

  if (!identifier || !newPassword) {
    return res.status(400).json({ error: "Username/email and new password are required" });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if the identifier exists in the consumer table
    const [consumerRows] = await db.query(
      `SELECT c.consumer_id, c.consumer_type, bc.verification_status
       FROM consumer c
       LEFT JOIN business_consumer bc ON c.consumer_id = bc.business_consumer_id
       WHERE c.email = ? OR 
             c.consumer_id IN (
               SELECT general_consumer_id FROM general_consumer WHERE username = ?
             ) OR 
             c.consumer_id IN (
               SELECT business_consumer_id FROM business_consumer WHERE username = ?
             )`,
      [identifier, identifier, identifier]
    );

    if (consumerRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const consumer = consumerRows[0];

    // Handle business consumer verification status
    if (consumer.consumer_type === "business") {
      if (consumer.verification_status === "pending") {
        return res.status(403).json({
          error: "The registration request for this account is still under review. Please wait for admin approval to change the password.",
        });
      }
      if (consumer.verification_status === "rejected") {
        return res.status(403).json({
          error: "Your account registration was rejected. Please contact support for assistance.",
        });
      }
    }

    // Update password in the respective table
    if (consumer.consumer_type === "general") {
      await db.query(
        "UPDATE general_consumer SET password = ? WHERE general_consumer_id = ?",
        [hashedPassword, consumer.consumer_id]
      );
    } else if (consumer.consumer_type === "business") {
      await db.query(
        "UPDATE business_consumer SET password = ? WHERE business_consumer_id = ?",
        [hashedPassword, consumer.consumer_id]
      );
    }

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
};



module.exports = { hashPassword, signupGeneralConsumer, signupBusinessConsumer, loginConsumer, resetPassword };