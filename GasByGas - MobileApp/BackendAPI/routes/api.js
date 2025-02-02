const express = require('express');
const { getGasRequests, placeGasRequest, getTokenDetails } = require('../controllers/gasRequests');
const { signupGeneralConsumer, signupBusinessConsumer, loginConsumer, resetPassword } = require('../controllers/auth');
const { getCylinderTypes } = require('../controllers/cylinderTypes');
const { getOutlets } = require('../controllers/outlets');
const { updateConsumer } = require('../controllers/updateConsumer');
const { getConsumerDetails } = require('../controllers/consumerController');


const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// GET route for general consumer signup
router.get('/general-consumer/signup', (req, res) => {
  res.status(200).json({ message: 'This endpoint is for POST requests to register general consumers.' });
});

// GET route for business consumer signup
router.get('/business-consumer/signup', (req, res) => {
  res.status(200).json({ message: 'This endpoint is for POST requests to register business consumers.' });
});

router.post('/general-consumer/signup', signupGeneralConsumer);
router.post('/business-consumer/signup', upload.single('certification_document'), signupBusinessConsumer);
router.post('/consumer/login', loginConsumer);
router.post("/consumer/reset-password", resetPassword);

router.get('/business-consumer/certification/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT certification_document FROM business_consumer WHERE business_consumer_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileBuffer = rows[0].certification_document;

    // Set the appropriate headers for serving the file
    res.setHeader('Content-Type', 'application/pdf'); // Change based on file type
    res.setHeader('Content-Disposition', 'inline; filename="certification.pdf"');
    res.send(fileBuffer);
  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

// Fetch cylinder types
router.get('/cylinder-types', getCylinderTypes);

// Fetch gas requests
router.get('/gas-requests', getGasRequests);

// Place a new gas request
router.post('/gas-requests', placeGasRequest);

// Fetch outlets
router.get('/outlets', getOutlets);

// Update consumer details
router.put('/update-consumer', updateConsumer);

// Get consumer details
router.get('/consumer-details/:id', getConsumerDetails);

// Get token details
router.get("/token-details/:request_id", getTokenDetails);


module.exports = router;
