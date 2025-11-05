// ============================================================================
// SECURE LOGIN SYSTEM - STARTER CODE
// ============================================================================
// Your task: Complete the TODO sections to build a secure authentication system
// 
// What you'll learn:
// - How to hash passwords securely with bcrypt
// - How to store users in MongoDB
// - How to validate user credentials
// - How to build signup and login endpoints
// ============================================================================

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// STEP 1: Connect to MongoDB Database
// ============================================================================
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true /* ??? */
})
.then(() => {
  console.log('✅ Connected to MongoDB')
})
.catch(err => console.log(err));

// ============================================================================
// STEP 2: Define User Schema (Database Structure)
// ============================================================================
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
});

const User = mongoose.model("User", userSchema);

// ============================================================================
// STEP 3: SIGNUP ROUTE - Create New User
// ============================================================================
// Endpoint: POST /signup
// Body: { "username": "tanay", "password": "hello123" }
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username and password required!!"});
    }


    const existing = User.findOne({ username });

    // TODO: If user exists, return status 400 with error: { error: "User already exists" }
    // YOUR CODE HERE
    if (existing) {
      return res.status(400).json({error: "User already exists"});
    }


    const hashed = bcrypt.hash(password, 10);

    // TODO: Create a new User object with username and hashed password
    // Hint: new User({ username, password: hashed })
    const user = new User({ username, hashed })


    await user.save();

    return res.status(201).json({message: "user saved successfully!"});

  } catch (error) {
    // Error handling is provided for you
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================================
// STEP 4: LOGIN ROUTE - Authenticate User
// ============================================================================
// Endpoint: POST /login
// Body: { "username": "tanay", "password": "hello123" }
app.post("/login", async (req, res) => {
  try {
    // TODO: Extract username and password from req.body
    const { username, password } = req.body;

    // TODO: Validate that username and password are provided
    // If not, return status 400 with error: { error: "Username and password are required" }
    // YOUR CODE HERE
    if (!username || !password) {
      return res.status(400).json({error: "Username and password are required"});
    }

    // TODO: Find user in database by username
    // Hint: Use User.findOne({ username })
    const user = User.findOne({ username });

    // TODO: If user is not found, return status 400 with error: { error: "User not found" }
    // YOUR CODE HERE
    if (!user) {
      return res.status(400).json({ error: "User not found"})
    }

    const valid = bcrypt.compare(password, user.password);


    if (!valid) {
      return res.status(401).json({ error: "Invalid password"});
    }


    return res.json({ message: "Login successful!" });

  } catch (error) {
    // Error handling is provided for you
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================================
// STEP 5: Start the Server
// ============================================================================

const PORT = process.env.PORT || 3000;

// TODO: Start the server using app.listen()
// - First argument: PORT
// - Second argument: callback function that logs:
//   "🚀 Server running on http://localhost:{PORT}"
// YOUR CODE HEREs
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ============================================================================
// TESTING YOUR CODE
// ============================================================================
// Once you complete all TODOs:
// 1. Run: npm start
// 2. Open test.html in your browser
// 3. Try signing up a new user
// 4. Try logging in with correct password (should succeed)
// 5. Try logging in with wrong password (should fail)
// ============================================================================

// ============================================================================
// SECURITY QUIZ (Answer these to check your understanding)
// ============================================================================
// Q1: Why do we hash passwords instead of storing them in plain text?
// A: To prevent hackers from knowing the actual passwords of users if they are able to break into a database.

// Q2: Can you reverse a bcrypt hash to get the original password?
// A: No

// Q3: What does the number 10 in bcrypt.hash(password, 10) mean?
// A: the number of salt rounds, then number of rounds in the hashing algo

// Q4: Why do we use bcrypt.compare() instead of comparing strings directly?
// A: bcrypt will mix the plain text password with a random string before storing the password, therefore the hash generated will not be the same as generating a hash with only the plain text string.

// Q5: What happens if two users have the same password?
// A: It will produce two different password due to the random salt.
// ============================================================================

