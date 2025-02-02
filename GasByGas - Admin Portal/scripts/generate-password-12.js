const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'Aaki29';
    const salt = await bcrypt.genSalt(12); // Use 12 rounds to match existing hash
    const hash = await bcrypt.hash(password, salt);
    console.log('Password:', password);
    console.log('Hash:', hash);
}

generateHash();
