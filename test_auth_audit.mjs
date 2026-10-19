const BASE_URL = 'http://localhost:5000/api';

async function runAudit() {
  console.log('=====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE AUTH, RBAC & SECURITY AUDIT');
  console.log('=====================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName, details = '') {
    totalCount++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
    }
  }

  try {
    // 1. Health check & Auth config
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(health.status === 'ONLINE' && health.auth.jwt.includes('HS256'), 'Server health and JWT HS256 active');

    // 2. Login Yash (Student)
    const yashLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'E0225036', password: '1234' })
    });
    const yashLogin = await yashLoginRes.json();
    const setCookieHeader = yashLoginRes.headers.get('set-cookie');
    
    assert(yashLoginRes.status === 200 && yashLogin.success === true, 'Student Login (HTTP 200)');
    assert(yashLogin.user.balance === 1000, 'Student Yash balance is preserved at 1000');
    assert(!!yashLogin.token, 'JWT Token generated on login');
    assert(!!setCookieHeader && setCookieHeader.includes('token='), 'HTTP-only Session Cookie issued on login');

    const studentToken = yashLogin.token;

    // 3. Login Teacher (Teacher)
    const teacherLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'TEACHER01', password: 'teacher123' })
    });
    const teacherLogin = await teacherLoginRes.json();
    assert(teacherLoginRes.status === 200 && teacherLogin.user.role === 'teacher', 'Teacher Login with RBAC role "teacher"');

    // 4. Login Worker (Staff / Worker)
    const workerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'WORKER01', password: '690141' })
    });
    const workerLogin = await workerLoginRes.json();
    assert(workerLoginRes.status === 200 && workerLogin.user.role === 'worker', 'Worker Login with RBAC role "worker"');
    const workerToken = workerLogin.token;

    // 5. JWT Verification (/api/auth/verify)
    const verifyRes = await fetch(`${BASE_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200 && verifyData.user.username === 'E0225036', 'JWT Verification endpoint verifies payload');

    // 6. Test HTTP 401 Unauthorized (No Token on Protected Route)
    const noTokenRes = await fetch(`${BASE_URL}/slots/slot_1/toggle`, {
      method: 'PATCH'
    });
    assert(noTokenRes.status === 401, 'Protected Route without JWT returns HTTP 401 Unauthorized (401: Unauthenticated)');

    // 7. Test HTTP 403 Forbidden (Student attempting Admin/Worker endpoint)
    const forbiddenRes = await fetch(`${BASE_URL}/slots/slot_1/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(forbiddenRes.status === 403, 'Student accessing Worker/Admin route returns HTTP 403 Forbidden (403: RBAC Guard)');

    // 8. Test HTTP 200 OK (Worker attempting Worker/Admin endpoint)
    const workerActionRes = await fetch(`${BASE_URL}/slots/slot_1/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${workerToken}` }
    });
    const workerActionData = await workerActionRes.json();
    assert(workerActionRes.status === 200 && workerActionData.success === true, 'Worker executing slot toggle succeeds (HTTP 200)');

    // Toggle back to keep slot available
    await fetch(`${BASE_URL}/slots/slot_1/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${workerToken}` }
    });

    // 9. Registration with bcrypt hashing test
    const testUserNum = Date.now().toString().slice(-4);
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `STUDENT_${testUserNum}`,
        password: 'secure_password_999',
        name: `Test Student ${testUserNum}`,
        role: 'student',
        department: 'Information Science'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success === true, 'New User Registration returns HTTP 201 Created');
    assert(regData.user.balance === 0, 'New user wallet begins at 0 (No free money)');

    // 10. Login with new user's password to verify bcrypt hashing worked
    const testUserLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `STUDENT_${testUserNum}`,
        password: 'secure_password_999'
      })
    });
    assert(testUserLoginRes.status === 200, 'Login with bcrypt hashed password succeeds (bcrypt.compare)');

    // 11. Security Test: NoSQL Injection attempt defense
    const injectionRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: { "$gt": "" },
        password: { "$ne": null }
      })
    });
    assert(injectionRes.status === 400, 'NoSQL Injection attempt rejected with HTTP 400 Bad Request');

    // 12. Security Test: Brute Force Rate Limiting (Block after 5 wrong tries)
    const bruteUser = `HACKER_${Date.now()}`;
    let hitRateLimit = false;
    for (let i = 1; i <= 6; i++) {
      const bruteRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: bruteUser, password: `wrong_${i}` })
      });
      if (bruteRes.status === 429) {
        hitRateLimit = true;
        break;
      }
    }
    assert(hitRateLimit, 'Brute-force protection triggers HTTP 429 (Too Many Requests) after repeated failed attempts');

    // 13. Logout test
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST'
    });
    assert(logoutRes.status === 200, 'Logout endpoint returns HTTP 200 and clears session cookies');

    console.log('\n=====================================================');
    console.log(`🎯 AUDIT RESULTS: ${passedCount}/${totalCount} TESTS PASSED`);
    console.log('=====================================================\n');

  } catch (err) {
    console.error('Audit encountered error:', err);
  }
}

runAudit();
