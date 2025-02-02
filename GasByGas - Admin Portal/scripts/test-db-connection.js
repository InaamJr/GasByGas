const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testConnection() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Aathi29@2005',
        database: 'GasByGas'
    });

    try {
        // Test connection
        console.log('Testing database connection...');
        await connection.connect();
        console.log('Database connected successfully!');

        // Check admin users
        console.log('\nChecking admin users...');
        const [rows] = await connection.execute('SELECT * FROM head_office_admin');
        console.log('Found', rows.length, 'admin users');
        
        for (const user of rows) {
            console.log('\nUser:', {
                id: user.admin_id,
                name: user.name,
                username: user.username,
                isSuperAdmin: user.is_super_admin,
                status: user.status,
                passwordLength: user.password?.length
            });

            // Test password verification
            const testPassword = 'Aaki29';
            const passwordMatch = await bcrypt.compare(testPassword, user.password);
            console.log('Password "Aaki29" matches:', passwordMatch);
            
            // Generate new hash for comparison
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log('Current stored hash:', user.password);
            console.log('New generated hash:', newHash);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

testConnection();
