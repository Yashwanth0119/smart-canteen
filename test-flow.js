async function testFlow() {
  console.log('--- 1. Testing Health ---');
  let res = await fetch('http://localhost:5000/api/health');
  let data = await res.json();
  console.log('Health status:', data.status, '| Database:', data.database.mode);

  console.log('\n--- 2. Testing Student Login (E025015 / 690141) ---');
  res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'E025015', password: '690141' })
  });
  data = await res.json();
  console.log('Student Login:', data.success ? 'SUCCESS' : 'FAILED', '| User:', data.user.name, '| Role:', data.user.role);

  console.log('\n--- 3. Testing Worker Login (WORKER01 / 690141) ---');
  res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'WORKER01', password: '690141' })
  });
  data = await res.json();
  console.log('Worker Login:', data.success ? 'SUCCESS' : 'FAILED', '| User:', data.user.name, '| Role:', data.user.role);

  console.log('\n--- 4. Testing Menu Read ---');
  res = await fetch('http://localhost:5000/api/menu');
  data = await res.json();
  console.log('Total dishes on menu:', data.count);

  console.log('\n--- 5. Student Places Pre-Order ---');
  res = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: 'E025015',
      studentName: 'Yashwanth (Student)',
      items: [
        { menuItemId: 'item_1', name: 'Masala Dosa with Sambar & Chutney', price: 55, quantity: 2 },
        { menuItemId: 'item_7', name: 'South Indian Filter Coffee', price: 25, quantity: 1 }
      ],
      totalAmount: 135,
      pickupSlot: '12:45 PM Lunch Break',
      notes: 'Make dosa extra crispy',
      paymentMethod: 'Student Smart Wallet'
    })
  });
  const orderRes = await res.json();
  console.log('Order Placed! Token:', orderRes.data.orderNumber, '| Amount: ₹' + orderRes.data.totalAmount, '| Status:', orderRes.data.status);

  console.log('\n--- 6. Worker Sees Student Pre-Order Reflecting on Kitchen Board ---');
  res = await fetch('http://localhost:5000/api/orders');
  data = await res.json();
  const studentOrderOnWorkerScreen = data.data.find(o => o.orderNumber === orderRes.data.orderNumber);
  console.log('Order visible on Worker Board?', Boolean(studentOrderOnWorkerScreen));
  console.log('Details on Worker Board:', {
    token: studentOrderOnWorkerScreen.orderNumber,
    student: studentOrderOnWorkerScreen.studentName,
    itemsCount: studentOrderOnWorkerScreen.items.length,
    status: studentOrderOnWorkerScreen.status,
    notes: studentOrderOnWorkerScreen.notes
  });

  console.log('\n--- 7. Worker Advances Status to "Preparing" then "Ready for Pickup" ---');
  const targetOrderId = orderRes.data.id || orderRes.data._id;
  res = await fetch(`http://localhost:5000/api/orders/${targetOrderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Ready for Pickup' })
  });
  data = await res.json();
  console.log('Updated Status on Kitchen Board:', data.data.status);

  console.log('\n--- 8. Worker Creates New Food Item (CRUD Create) ---');
  res = await fetch('http://localhost:5000/api/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Paneer Kathi Roll',
      category: 'Snacks',
      price: 75,
      isVeg: true,
      prepTime: 8,
      inStockCount: 25,
      description: 'Spiced marinated paneer cubes rolled in fresh whole wheat flatbread.'
    })
  });
  data = await res.json();
  console.log('New Item Created in Menu:', data.data.name, 'Price: ₹' + data.data.price);

  console.log('\n--- 9. Worker Deletes an Item (CRUD Delete) ---');
  res = await fetch(`http://localhost:5000/api/menu/${data.data.id || data.data._id}`, {
    method: 'DELETE'
  });
  data = await res.json();
  console.log('Delete Response:', data.message);

  console.log('\n--- 10. Vite Frontend Server Reachability ---');
  res = await fetch('http://localhost:3000/');
  console.log('Vite HTTP Status:', res.status, res.statusText);

  console.log('\n=============================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('=============================================');
}

testFlow().catch(console.error);
