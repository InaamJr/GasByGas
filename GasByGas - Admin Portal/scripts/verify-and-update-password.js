const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function verifyAndUpdatePassword() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Aathi29@2005',
        database: 'GasByGas'
    });

    try {
        // First, let's check the current password hash
        const [rows] = await connection.execute(
            'SELECT admin_id, username, password FROM head_office_admin WHERE username = ?',
            ['Aathi29']
        );

        const user = rows[0];
        console.log('Current password hash:', user.password);

        // Generate a new hash
        const password = 'Aaki29';
        const salt = await bcrypt.genSalt(12);
        const newHash = await bcrypt.hash(password, salt);
        console.log('New hash generated:', newHash);

        // Update the password
        await connection.execute(
            'UPDATE head_office_admin SET password = ? WHERE username = ?',
            [newHash, 'Aathi29']
        );
        console.log('Password updated successfully');

        // Verify the new password
        const [updatedRows] = await connection.execute(
            'SELECT password FROM head_office_admin WHERE username = ?',
            ['Aathi29']
        );
        
        const updatedUser = updatedRows[0];
        console.log('Updated password hash:', updatedUser.password);

        // Test password match
        const isMatch = await bcrypt.compare(password, updatedUser.password);
        console.log('Password match test:', isMatch);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

verifyAndUpdatePassword();
