const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const ORIGINAL_API = "https://api-tg-sukunaheartless.onrender.com/api";
const ORIGINAL_KEY = "Heartlesss";
const MY_OWNER = "t.me/truongphuhaokhithaylonquenloi";

app.get("/api", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      owner: MY_OWNER,
      success: false,
      error: "Missing required parameter: id",
    });
  }

  try {
    const url = `${ORIGINAL_API}?key=${ORIGINAL_KEY}&spell=${encodeURIComponent(id)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Upstream API error: ${response.status}`);
    }

    const data = await response.json();

    // Replace owner, keep everything else as-is
    const modified = {
      ...data,
      owner: MY_OWNER,
    };

    return res.json(modified);
  } catch (err) {
    return res.status(500).json({
      owner: MY_OWNER,
      success: false,
      error: "Failed to fetch from upstream API",
      detail: err.message,
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", owner: MY_OWNER });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
