const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "yourSecretKey", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Welcome</title>
</head>
<body>
    <h1>Welcome to the Game High Scores API</h1>
</body>
</html>`);
});

// POST route for user registration
app.post(
  "/signup",
  [
    body("userHandle")
      .isLength({ min: 6 })
      .withMessage("userHandle must be at least 6 characters"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const token = jwt.sign(
      { userHandle: req.body.userHandle },
      "yourSecretKey",
      { expiresIn: "1h" }
    );
    res.status(201).json({ token });
  }
);

// POST route for user login
app.post(
  "/login",
  [
    body("userHandle").isLength({ min: 6 }),
    body("password").isLength({ min: 6 }),
  ],
  (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const token = jwt.sign(
      { userHandle: req.body.userHandle },
      "yourSecretKey",
      { expiresIn: "1h" }
    );
    res.status(200).json({ jsonWebToken: token });
  }
);

// POST route for submitting high scores
app.post(
  "/high-scores",
  authenticateToken,
  [
    body("level").notEmpty(),
    body("userHandle").notEmpty(),
    body("score").isNumeric(),
    body("timestamp").isISO8601(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    

    res.status(201).send("High score submitted successfully");
  }
);

// GET route for high scores with pagination
app.get("/high-scores", (req, res) => {
  let { level, page = 1 } = req.query;
  page = parseInt(page, 10);
  const pageSize = 20; // Assuming 20 scores per page

  // Fetching and sorting logic here, using level and pagination

  // Placeholder response
  res.status(200).json({
    highScores: [
      // Example score, replace with actual scores from your storage
      {
        level: "level1",
        userHandle: "player1",
        score: 500,
        timestamp: "2024-02-22T12:34:56Z",
      },
    ],
    page,
    pageSize,
  });
});

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
