const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updateAllAdminPasswords() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Aathi29@2005',
        database: 'GasByGas'
    });

    try {
        // Generate hash
        const password = 'Aaki29';
        const salt = await bcrypt.genSalt(12);
        const newHash = await bcrypt.hash(password, salt);
        console.log('New hash generated:', newHash);

        // Update all admin passwords
        await connection.execute(
            'UPDATE head_office_admin SET password = ? WHERE username IN (?, ?)',
            [newHash, 'Aathi29', 'Aaki22']
        );
        console.log('All admin passwords updated successfully');

        // Verify updates
        const [rows] = await connection.execute(
            'SELECT username, password FROM head_office_admin WHERE username IN (?, ?)',
            ['Aathi29', 'Aaki22']
        );

        for (const user of rows) {
            console.log(`\nVerifying password for ${user.username}:`);
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password hash:', user.password);
            console.log('Password match test:', isMatch);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

updateAllAdminPasswords();
