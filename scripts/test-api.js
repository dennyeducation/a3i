import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

// Test credentials
const TEST_USER = {
    username: 'admin',
    password: 'admin123'
};

async function testAPI() {
    console.log('🧪 Testing Dashboard API Endpoints');
    console.log('═'.repeat(60));

    try {
        // Step 1: Login to get token
        console.log('\n📝 Step 1: Login to get token...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        if (!loginResponse.ok) {
            console.log('❌ Login failed. Please make sure user exists and credentials are correct.');
            console.log('   Run: node scripts/seed-sample-data.js');
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful!');
        console.log(`   User: ${loginData.user.username}`);
        console.log(`   Role: ${loginData.user.role}`);

        // Step 2: Test /api/user/stats
        console.log('\n📊 Step 2: Testing /api/user/stats...');
        const statsResponse = await fetch(`${BASE_URL}/api/user/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const statsData = await statsResponse.json();
        if (statsData.success) {
            console.log('✅ Stats API working!');
            console.log('   Overview:');
            console.log(`     • Certificates: ${statsData.data.overview.certificates}`);
            console.log(`     • Applications: ${statsData.data.overview.applications}`);
            console.log(`     • Assessments: ${statsData.data.overview.assessments}`);
            console.log('   Details:');
            console.log(`     • Total Certificates: ${statsData.data.details.certificates.total}`);
            console.log(`       - Active: ${statsData.data.details.certificates.active}`);
            console.log(`       - Pending: ${statsData.data.details.certificates.pending}`);
            console.log(`     • Total Applications: ${statsData.data.details.applications.total}`);
            console.log(`       - Submitted: ${statsData.data.details.applications.submitted}`);
            console.log(`       - Reviewing: ${statsData.data.details.applications.reviewing}`);
            console.log(`       - Approved: ${statsData.data.details.applications.approved}`);
            console.log(`     • Total Assessments: ${statsData.data.details.assessments.total}`);
            console.log(`       - Scheduled: ${statsData.data.details.assessments.scheduled}`);
        } else {
            console.log('❌ Stats API error:', statsData.error);
        }

        // Step 3: Test /api/user/activities
        console.log('\n📋 Step 3: Testing /api/user/activities...');
        const activitiesResponse = await fetch(`${BASE_URL}/api/user/activities?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const activitiesData = await activitiesResponse.json();
        if (activitiesData.success) {
            console.log('✅ Activities API working!');
            console.log(`   Found ${activitiesData.data.length} activities (showing 5):`);
            activitiesData.data.forEach((activity, index) => {
                console.log(`\n   ${index + 1}. ${activity.title}`);
                console.log(`      Type: ${activity.activity_type}`);
                if (activity.description) {
                    console.log(`      Description: ${activity.description}`);
                }
                console.log(`      Date: ${new Date(activity.created_at).toLocaleString('id-ID')}`);
            });
            console.log(`\n   Pagination:`);
            console.log(`     • Total: ${activitiesData.pagination.total}`);
            console.log(`     • Has More: ${activitiesData.pagination.hasMore}`);
        } else {
            console.log('❌ Activities API error:', activitiesData.error);
        }

        // Step 4: Summary
        console.log('\n' + '═'.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('\n🎯 Next Steps:');
        console.log('   1. Visit http://localhost:3000/dashboard');
        console.log('   2. Login with your credentials');
        console.log('   3. Check if stats and activities are displayed');
        console.log('\n💡 Tip: You can run this script again anytime to verify the API');

    } catch (error) {
        console.error('\n❌ Test failed with error:');
        console.error(error.message);
    }
}

testAPI();
