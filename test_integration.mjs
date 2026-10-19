// Comprehensive Frontend-Backend Integration Test
const BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('   FRONTEND-BACKEND INTEGRATION COMPREHENSIVE TEST  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const test = (desc, condition) => {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  };

  try {
    // 1. Connection & Health (GET 200 OK)
    const healthRes = await fetch(`${BASE}/health`);
    const healthData = await healthRes.json();
    test('1. Connection & Health (GET 200 OK)', healthRes.status === 200 && healthData.status === 'ONLINE');

    // 2. CORS Header Verification
    const corsHeader = healthRes.headers.get('access-control-allow-origin');
    test('2. CORS Header Presence (Access-Control-Allow-Origin)', corsHeader === '*' || corsHeader !== null);

    // 3. Menu Fetch (GET 200 OK)
    const menuRes = await fetch(`${BASE}/menu`);
    const menuData = await menuRes.json();
    test('3. Fetch Menu Items (GET 200 OK)', menuRes.status === 200 && Array.isArray(menuData.data));

    // 4. Successful Order Creation (POST 201 Created)
    const orderPayload = {
      studentId: 'E0225036',
      studentName: 'Yash',
      items: [{ menuItemId: 'item_1', name: 'Masala Dosa', price: 55, quantity: 1 }],
      totalAmount: 55,
      pickupSlot: 'Immediate (10-15 mins)',
      paymentMethod: 'Pay at Counter'
    };
    const orderRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const orderData = await orderRes.json();
    test('4. Order Creation (POST 201 Created)', orderRes.status === 201 && orderData.success === true);
    const createdOrderId = orderData.data?.id || orderData.data?._id;

    // 5. Bad Request Validation (POST 400 Bad Request)
    const badOrderRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Missing required fields
    });
    const badOrderData = await badOrderRes.json();
    test('5. Validation & Bad Request (POST 400 Bad Request)', badOrderRes.status === 400 && badOrderData.success === false);

    // 6. Unauthorized Login (POST 401 Unauthorized)
    const badLoginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'E025015', password: 'wrongpassword' })
    });
    const badLoginData = await badLoginRes.json();
    test('6. Authentication Rejection (POST 401 Unauthorized)', badLoginRes.status === 401 && badLoginData.success === false);

    // 7. Forbidden Action (DELETE 403 Forbidden on Completed Order)
    const forbiddenRes = await fetch(`${BASE}/orders/ord_past_01`, {
      method: 'DELETE'
    });
    const forbiddenData = await forbiddenRes.json();
    test('7. Access Restriction / Guard (DELETE 403 Forbidden)', forbiddenRes.status === 403 && forbiddenData.success === false);

    // 8. Resource Not Found (GET 404 Not Found)
    const notFoundRes = await fetch(`${BASE}/menu/invalid_id_9999`);
    const notFoundData = await notFoundRes.json();
    test('8. Resource Not Found Handling (GET 404 Not Found)', notFoundRes.status === 404 && notFoundData.success === false);

    // 9. Patch Method (PATCH 200 OK)
    const patchRes = await fetch(`${BASE}/slots/slot_1/toggle`, {
      method: 'PATCH'
    });
    const patchData = await patchRes.json();
    test('9. Slot Capacity Toggle (PATCH 200 OK)', patchRes.status === 200 && patchData.success === true);

    // Toggle slot back
    await fetch(`${BASE}/slots/slot_1/toggle`, { method: 'PATCH' });

    // Clean up created test order
    if (createdOrderId) {
      await fetch(`${BASE}/orders/${createdOrderId}`, { method: 'DELETE' });
    }

    console.log(`\n====================================================`);
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`====================================================\n`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
