require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser"); // Corrected typo: 'cookiePaser' to 'cookieParser'

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();

// Ensure PORT is a number
const PORT = parseInt(process.env.PORT, 10) || 8000;

// Set Mongoose strictQuery option to suppress deprecation warning
mongoose.set('strictQuery', false); // or true based on your needs

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  });

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Corrected typo
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

// Routes
app.get("/", async (req, res) => {
  try {
    const allBlogs = await Blog.find({});
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

// Start the server
app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
