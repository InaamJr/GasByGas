const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createNewAdmin() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Aathi29@2005',
        database: 'GasByGas'
    });

    try {
        // Admin credentials
        const adminData = {
            username: 'admin',
            password: 'Admin123',
            name: 'System Admin',
            nic: '199912345678',
            contact: '+94771234567',
            email: 'admin@gasbygas.com'
        };

        // Generate password hash
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);
        
        // First, delete existing admin if exists
        await connection.execute(
            'DELETE FROM head_office_admin WHERE username = ?',
            [adminData.username]
        );

        // Insert new admin
        await connection.execute(
            `INSERT INTO head_office_admin (
                name,
                nic,
                contact,
                email,
                username,
                password,
                is_super_admin,
                status,
                profile_image
            ) VALUES (?, ?, ?, ?, ?, ?, TRUE, 'active', '')`,
            [
                adminData.name,
                adminData.nic,
                adminData.contact,
                adminData.email,
                adminData.username,
                hashedPassword
            ]
        );

        console.log('Admin created successfully');

        // Verify the password
        const [rows] = await connection.execute(
            'SELECT username, password FROM head_office_admin WHERE username = ?',
            [adminData.username]
        );

        if (rows.length > 0) {
            const user = rows[0];
            const isMatch = await bcrypt.compare(adminData.password, user.password);
            console.log('\nVerification Results:');
            console.log('Username:', user.username);
            console.log('Stored Hash:', user.password);
            console.log('Password Match Test:', isMatch);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

createNewAdmin();
