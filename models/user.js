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

    const errors = [];
    // Unsure how to do this check on the client side
    if (await User.findByUsername(username, db))
        errors.push("Username already taken");
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
