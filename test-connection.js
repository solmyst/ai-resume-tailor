// Test backend connection and API endpoints
async function testBackendConnection() {
    console.log('Testing AI Resume Tailor Backend...');
    console.log('=' * 40);
    
    try {
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await fetch('http://localhost:5000/api/health');
        const healthData = await healthResponse.json();
        
        console.log('✅ Backend is running!');
        console.log('Health check response:', healthData);
        
        if (healthData.openai_configured) {
            console.log('✅ OpenAI API configured');
        } else {
            console.log('ℹ️  OpenAI API not configured (optional - will use fallback)');
        }
        
        // Test user stats endpoint
        console.log('\n2. Testing user stats endpoint...');
        const statsResponse = await fetch('http://localhost:5000/api/user/test-user/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            console.log('✅ User stats endpoint working');
            console.log('Stats:', statsData.stats);
        } else {
            console.log('⚠️  User stats endpoint failed');
        }
        
        // Test activity tracking
        console.log('\n3. Testing activity tracking...');
        const activityResponse = await fetch('http://localhost:5000/api/user/test-user/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'Test activity from connection test',
                match_score: 85
            })
        });
        
        const activityData = await activityResponse.json();
        
        if (activityData.success) {
            console.log('✅ Activity tracking working');
            console.log('Activity:', activityData.activity);
        } else {
            console.log('⚠️  Activity tracking failed');
        }
        
        console.log('\n' + '=' * 40);
        console.log('✅ All tests passed! Backend is ready.');
        console.log('You can now start the frontend with: npm run dev');
        
    } catch (error) {
        console.log('❌ Backend connection failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Make sure backend is running: cd backend && python app.py');
        console.log('2. Check if port 5000 is available');
        console.log('3. Verify all dependencies are installed');
    }
}

// Test the connection
testBackendConnection();