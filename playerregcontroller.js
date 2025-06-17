const clubplayers = require('../dataformyapi/clubplayers'); // importing players schema data model
const bcrypt = require('bcrypt');

const handlenewplayer = async (req, res) => {
    const { username, password, name, position, jerseyno, playerrole} = req.body;
    
    // 1. Input validation
    if (!username || !password || !name || !position || !jerseyno|| !playerrole) {
        return res.status(400).json({
            message: "All fields are required"});
    }

    try {
        // 2. Check for duplicate username
        const existingUser = await clubplayers.findOne({ username }).exec();
        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        // 3. Hash password and create and store player
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await clubplayers.create({
            username,
            password: hashedPassword,
            position,
            name,
            jerseyno,
            playerrole
        });

        // 4. Success response (EXCLUDE password)
        return res.status(201).json({
            message: "Player registered successfully"
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            message: "Registration failed"
        });
    }
};

module.exports = { handlenewplayer };