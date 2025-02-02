const db = require('../config/db');


// Fetch gas requests for a consumer
const getGasRequests = async (req, res) => {
  const consumerId = req.query.consumer_id; // Assume consumer ID is passed as a query parameter

  if (!consumerId) {
    return res.status(400).json({ error: 'Consumer ID is required' });
  }

  try {
    // Query to fetch gas requests and check if tokens exist
    const [rows] = await db.query(
      `SELECT 
        gr.request_id, 
        gr.request_date, 
        gr.expected_pickup_date, 
        gr.status, 
        (SELECT COUNT(*) FROM token t WHERE t.request_id = gr.request_id) AS token_available 
       FROM gas_request gr
       WHERE gr.consumer_id = ?`,
      [consumerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No gas requests found' });
    }

    // Map token_available to boolean
    const result = rows.map(row => ({
      ...row,
      token_available: row.token_available > 0
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching gas requests:', error);
    res.status(500).json({ error: 'Failed to fetch gas requests' });
  }
};

// Place a new gas request v1
// const placeGasRequest = async (req, res) => {
//   const { consumer_id, outlet_id, expected_pickup_date, requests } = req.body;

//   if (!consumer_id || !outlet_id || !expected_pickup_date || !requests || requests.length === 0) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   try {
//     // Fetch the consumer type
//     const [consumerTypeRows] = await db.query(
//       `SELECT consumer_type 
//        FROM consumer 
//        WHERE consumer_id = ?`,
//       [consumer_id]
//     );

//     if (consumerTypeRows.length === 0) {
//       return res.status(404).json({ error: "Consumer not found" });
//     }

//     const consumerType = consumerTypeRows[0].consumer_type;

//     // If the consumer is "general", apply monthly limits
//     if (consumerType === "general") {
//       const currentMonth = new Date().getMonth() + 1; // Current month (1-based)
//       const currentYear = new Date().getFullYear(); // Current year
    
//       const expectedMonth = new Date(expected_pickup_date).getMonth() + 1; // Month from expected_pickup_date
//       const expectedYear = new Date(expected_pickup_date).getFullYear(); // Year from expected_pickup_date
    
//       // Apply limits only if the request is for the current month
//       if (expectedMonth === currentMonth && expectedYear === currentYear) {
//         const [monthlyTotals] = await db.query(
//           `SELECT 
//               grd.cylinder_type_id, 
//               SUM(grd.quantity) AS total_quantity
//            FROM gas_request gr
//            JOIN gas_request_details grd ON gr.request_id = grd.request_id
//            WHERE gr.consumer_id = ? 
//              AND MONTH(gr.request_date) = ? 
//              AND YEAR(gr.request_date) = ?
//            GROUP BY grd.cylinder_type_id`,
//           [consumer_id, currentMonth, currentYear] // Scoped to the logged-in consumer
//         );

//         console.log("Monthly Totals for Consumer:", monthlyTotals); // Debug log
    
//         // Define monthly limits for general consumers
//         const limits = {
//           1: 2, // Small gas limit
//           2: 2, // Medium gas limit
//           3: 2, // Large gas limit
//         };
    
//         for (const request of requests) {
//           // Find the total quantity for the current gas type from previous requests
//           const currentQuantity = parseInt(
//             monthlyTotals.find((mt) => mt.cylinder_type_id === request.gas_type_id)?.total_quantity || 0,
//             10
//           );
        
//           // Calculate the cumulative quantity after adding the new request
//           const newTotal = currentQuantity + request.quantity;
        
//           console.log(`Gas Type ID: ${request.gas_type_id}`);
//           console.log(`Current Quantity: ${currentQuantity}`);
//           console.log(`Requested Quantity: ${request.quantity}`);
//           console.log(`New Total: ${newTotal}`);
//           console.log(`Limit: ${limits[request.gas_type_id]}`);
        
//           // Validate against the limit
//           if (newTotal > limits[request.gas_type_id]) {
//             return res.status(400).json({
//               error: `Monthly limit exceeded for gas type ID: ${request.gas_type_id}`,
//             });
//           }
//         }        
//       }
//     }    

//     // Save the request (common for both consumer types)
//     const conn = await db.getConnection();
//     await conn.beginTransaction();

//     const [insertResult] = await conn.query(
//       "INSERT INTO gas_request (consumer_id, outlet_id, request_date, expected_pickup_date, status, reallocation_status) VALUES (?, ?, NOW(), ?, ?, ?)",
//       [consumer_id, outlet_id, expected_pickup_date, "pending", "original"]
//     );

//     const requestId = insertResult.insertId;

//     // Insert each gas type and quantity into gas_request_details
//     for (const request of requests) {
//       await conn.query(
//         "INSERT INTO gas_request_details (request_id, cylinder_type_id, quantity) VALUES (?, ?, ?)",
//         [requestId, request.gas_type_id, request.quantity]
//       );
//     }

//     await conn.commit();
//     conn.release();

//     res.status(201).json({ message: "Gas request placed successfully", request_id: requestId });
//   } catch (error) {
//     console.error("Error placing gas request:", error);
//     res.status(500).json({ error: "Failed to place gas request" });
//   }
// };



// Place a new gas request v2
// const placeGasRequest = async (req, res) => {
//   const { consumer_id, outlet_id, expected_pickup_date, requests } = req.body;

//   if (!consumer_id || !outlet_id || !expected_pickup_date || !requests || requests.length === 0) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   try {
//     // Fetch cylinder names for user-friendly messages
//     const [cylinderRows] = await db.query(
//       `SELECT type_id AS cylinder_type_id, name AS cylinder_name FROM cylinder_types`
//     );
//     const cylinderMap = {};
//     cylinderRows.forEach((row) => {
//       cylinderMap[row.cylinder_type_id] = row.cylinder_name;
//     });

//     // Check stock availability
//     const insufficientStockTypes = [];
//     for (const request of requests) {
//       const [stockRows] = await db.query(
//         `SELECT quantity FROM outlet_stock WHERE outlet_id = ? AND cylinder_type_id = ?`,
//         [outlet_id, request.gas_type_id]
//       );
//       const stockQuantity = stockRows[0]?.quantity || 0;
//       if (stockQuantity < request.quantity) {
//         insufficientStockTypes.push(request.gas_type_id);
//       }
//     }

//     // If stock is insufficient, check delivery schedule
//     if (insufficientStockTypes.length > 0) {
//       const [deliveryRows] = await db.query(
//         `SELECT o.expected_delivery_date, o.status
//          FROM outlet_order o
//          WHERE o.outlet_id = ? AND o.expected_delivery_date <= ? AND o.status = 'scheduled'`,
//         [outlet_id, expected_pickup_date]
//       );

//       if (deliveryRows.length === 0) {
//         const insufficientCylinderNames = insufficientStockTypes.map(
//           (typeId) => cylinderMap[typeId]
//         );
//         return res.status(400).json({
//           error: `Stock is insufficient for ${insufficientCylinderNames.join(", ")}. Try another outlet.`,
//         });
//       }
//     }

//     // Fetch the consumer type
//     const [consumerTypeRows] = await db.query(
//       `SELECT consumer_type 
//        FROM consumer 
//        WHERE consumer_id = ?`,
//       [consumer_id]
//     );

//     if (consumerTypeRows.length === 0) {
//       return res.status(404).json({ error: "Consumer not found" });
//     }

//     const consumerType = consumerTypeRows[0].consumer_type;

//     // Apply monthly limits for general consumers
//     if (consumerType === "general") {
//       const currentMonth = new Date().getMonth() + 1;
//       const currentYear = new Date().getFullYear();

//       const expectedMonth = new Date(expected_pickup_date).getMonth() + 1;
//       const expectedYear = new Date(expected_pickup_date).getFullYear();

//       if (expectedMonth === currentMonth && expectedYear === currentYear) {
//         const [monthlyTotals] = await db.query(
//           `SELECT 
//               grd.cylinder_type_id, 
//               SUM(grd.quantity) AS total_quantity
//            FROM gas_request gr
//            JOIN gas_request_details grd ON gr.request_id = grd.request_id
//            WHERE gr.consumer_id = ? 
//              AND MONTH(gr.request_date) = ? 
//              AND YEAR(gr.request_date) = ?
//            GROUP BY grd.cylinder_type_id`,
//           [consumer_id, currentMonth, currentYear]
//         );

//         const limits = {
//           1: 2, // Small gas limit
//           2: 2, // Medium gas limit
//           3: 2, // Large gas limit
//         };

//         for (const request of requests) {
//           const currentQuantity = parseInt(
//             monthlyTotals.find((mt) => mt.cylinder_type_id === request.gas_type_id)?.total_quantity || 0,
//             10
//           );
//           const newTotal = currentQuantity + request.quantity;

//           if (newTotal > limits[request.gas_type_id]) {
//             return res.status(400).json({
//               error: `Monthly limit exceeded for ${cylinderMap[request.gas_type_id]}.`,
//             });
//           }
//         }
//       }
//     }

//     // Save the request (common for both consumer types)
//     const conn = await db.getConnection();
//     await conn.beginTransaction();

//     const [insertResult] = await conn.query(
//       "INSERT INTO gas_request (consumer_id, outlet_id, request_date, expected_pickup_date, status, reallocation_status) VALUES (?, ?, NOW(), ?, ?, ?)",
//       [consumer_id, outlet_id, expected_pickup_date, "pending", "original"]
//     );

//     const requestId = insertResult.insertId;

//     for (const request of requests) {
//       await conn.query(
//         "INSERT INTO gas_request_details (request_id, cylinder_type_id, quantity) VALUES (?, ?, ?)",
//         [requestId, request.gas_type_id, request.quantity]
//       );
//     }

//     await conn.commit();
//     conn.release();

//     res.status(201).json({ message: "Gas request placed successfully", request_id: requestId });
//   } catch (error) {
//     console.error("Error placing gas request:", error);
//     res.status(500).json({ error: "Failed to place gas request" });
//   }
// };


// Place a new gas request v3
const placeGasRequest = async (req, res) => {
  const { consumer_id, outlet_id, expected_pickup_date, requests } = req.body;

  if (!consumer_id || !outlet_id || !expected_pickup_date || !requests || requests.length === 0) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Fetch cylinder names for user-friendly messages
    const [cylinderRows] = await db.query(
      `SELECT type_id AS cylinder_type_id, name AS cylinder_name FROM cylinder_types`
    );
    const cylinderMap = {};
    cylinderRows.forEach((row) => {
      cylinderMap[row.cylinder_type_id] = row.cylinder_name;
    });

    // Check stock availability
    const insufficientStockTypes = [];
    for (const request of requests) {
      const [stockRows] = await db.query(
        `SELECT quantity FROM outlet_stock WHERE outlet_id = ? AND cylinder_type_id = ?`,
        [outlet_id, request.gas_type_id]
      );
      const stockQuantity = stockRows[0]?.quantity || 0;
      if (stockQuantity < request.quantity) {
        insufficientStockTypes.push(request.gas_type_id);
      }
    }

    // If stock is insufficient, check the new delivery_schedule table
    if (insufficientStockTypes.length > 0) {
      const [deliveryRows] = await db.query(
        `SELECT d.delivery_date
         FROM delivery_schedule d
         WHERE d.order_id IN (
           SELECT order_id FROM outlet_order WHERE outlet_id = ?
         ) 
         AND d.delivery_date <= ? 
         AND d.status = 'scheduled'`,
        [outlet_id, expected_pickup_date]
      );

      if (deliveryRows.length === 0) {
        const insufficientCylinderNames = insufficientStockTypes.map(
          (typeId) => cylinderMap[typeId]
        );
        return res.status(400).json({
          error: `Stock is insufficient for ${insufficientCylinderNames.join(", ")}. Try another outlet.`,
        });
      }
    }

    // Fetch the consumer type
    const [consumerTypeRows] = await db.query(
      `SELECT consumer_type FROM consumer WHERE consumer_id = ?`,
      [consumer_id]
    );

    if (consumerTypeRows.length === 0) {
      return res.status(404).json({ error: "Consumer not found" });
    }

    const consumerType = consumerTypeRows[0].consumer_type;

    // Apply monthly limits for general consumers
    if (consumerType === "general") {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const expectedMonth = new Date(expected_pickup_date).getMonth() + 1;
      const expectedYear = new Date(expected_pickup_date).getFullYear();

      if (expectedMonth === currentMonth && expectedYear === currentYear) {
        const [monthlyTotals] = await db.query(
          `SELECT 
              grd.cylinder_type_id, 
              SUM(grd.quantity) AS total_quantity
           FROM gas_request gr
           JOIN gas_request_details grd ON gr.request_id = grd.request_id
           WHERE gr.consumer_id = ? 
             AND MONTH(gr.request_date) = ? 
             AND YEAR(gr.request_date) = ?
           GROUP BY grd.cylinder_type_id`,
          [consumer_id, currentMonth, currentYear]
        );

        const limits = {
          1: 2, // Small gas limit
          2: 2, // Medium gas limit
          3: 2, // Large gas limit
        };

        for (const request of requests) {
          const currentQuantity = parseInt(
            monthlyTotals.find((mt) => mt.cylinder_type_id === request.gas_type_id)?.total_quantity || 0,
            10
          );
          const newTotal = currentQuantity + request.quantity;

          if (newTotal > limits[request.gas_type_id]) {
            return res.status(400).json({
              error: `Monthly limit exceeded for ${cylinderMap[request.gas_type_id]}.`,
            });
          }
        }
      }
    }

    // Save the request (common for both consumer types)
    const conn = await db.getConnection();
    await conn.beginTransaction();

    const [insertResult] = await conn.query(
      "INSERT INTO gas_request (consumer_id, outlet_id, request_date, expected_pickup_date, status, reallocation_status) VALUES (?, ?, NOW(), ?, ?, ?)",
      [consumer_id, outlet_id, expected_pickup_date, "pending", "original"]
    );

    const requestId = insertResult.insertId;

    for (const request of requests) {
      await conn.query(
        "INSERT INTO gas_request_details (request_id, cylinder_type_id, quantity) VALUES (?, ?, ?)",
        [requestId, request.gas_type_id, request.quantity]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({ message: "Gas request placed successfully", request_id: requestId });
  } catch (error) {
    console.error("Error placing gas request:", error);
    res.status(500).json({ error: "Failed to place gas request" });
  }
};


// Fetch token details for a given request ID
const getTokenDetails = async (req, res) => {
  const { request_id } = req.params;

  if (!request_id) {
    return res.status(400).json({ error: "Request ID is required" });
  }

  try {
    const [tokenRows] = await db.query(
      `SELECT 
        t.token_no, 
        t.expiry_date,
        t.status,  -- ✅ Added status field
        o.outlet_name,
        gr.expected_pickup_date
      FROM token t
      JOIN gas_request gr ON t.request_id = gr.request_id
      JOIN outlet o ON gr.outlet_id = o.outlet_id
      WHERE t.request_id = ?`,
      [request_id]
    );

    if (tokenRows.length === 0) {
      return res.status(404).json({ error: "Token not found" });
    }

    const tokenData = tokenRows[0];

    // Fetch gas types and quantities for this request
    const [gasDetailsRows] = await db.query(
      `SELECT 
        c.name AS cylinder_name,
        grd.quantity
      FROM gas_request_details grd
      JOIN cylinder_types c ON grd.cylinder_type_id = c.type_id
      WHERE grd.request_id = ?`,
      [request_id]
    );

    tokenData.gasDetails = gasDetailsRows;

    res.status(200).json(tokenData);
  } catch (error) {
    console.error("Error fetching token details:", error);
    res.status(500).json({ error: "Failed to fetch token details" });
  }
};


module.exports = { getGasRequests, placeGasRequest, getTokenDetails };
