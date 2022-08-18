const bcrypt = require('bcryptjs');

class User {

    constructor(props) {
        this.id = props.id;
        this.username = props.username;
        this.password = props.password;
        this.email = props.email;
    }

    static async findByUsername(username, db) {
        const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
        if (user)
            return (new User(user));
        else
            return null;
    }

    static async signup(username, email, password, db) {
        let testCap = /[A-Z]/;
        let testLower = /[a-z]/;
        let testDigit = /[0-9]/;
        
        const errors = [];
        if (username.length == "")
            errors.push("Username cannot be blank");
        if (password.length < 8)
            errors.push("Password must have at least 8 characters");
        if (!testCap.test(password))
            errors.push("Password must have a capital letter");
        if (!testLower.test(password))
            errors.push("Password must have a lowercase letter");
        if (!testDigit.test(password))
            errors.push("Password must have a digit");

        // If any errors, return false/errors etc
        if (errors.length != 0)
            return [false, null, errors];

        const pwhash = await bcrypt.hash(password, 10);
        await db.run(`INSERT INTO users (username, email, password)
                VALUES (?, ?, ?)`, [username, email, pwhash]);

        const user = new User(await User.findByUsername(username, db));

        return [true, user, errors];
    }

    static async login(username, password, db) {

        if (username.length == "" || password.length < 8 )
            return null;

        const user = await User.findByUsername(username, db)
        if (!user)
            return null;

        const checkpw = await bcrypt.compare(password, user.password);
        if (checkpw)
            return user;

        return null;
        }
}

module.exports = User;
