const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const ORIGINAL_API = "https://api-tg-sukunaheartless.onrender.com/api";
const ORIGINAL_KEY = "Heartlesss";
const MY_OWNER = "t.me/truongphuhaokhithaylonquenloi";

// ID hoặc tên bị troll
const TROLL_IDS   = ["8001225219","8339194148"];
const TROLL_NAMES = ["truongphuhaokhithaylonquenloi","@nguoilabantool"];

function isTroll(id, data) {
  const idStr = String(id).toLowerCase().trim();

  // Check theo id truyền vào
  if (TROLL_IDS.includes(idStr)) return true;
  if (TROLL_NAMES.includes(idStr)) return true;

  // Check theo kết quả trả về từ API gốc (number, name, username, ...)
  if (data && data.result) {
    const vals = Object.values(data.result).map((v) =>
      String(v).toLowerCase().trim()
    );
    for (const name of TROLL_NAMES) {
      if (vals.some((v) => v.includes(name))) return true;
    }
  }

  return false;
}

function trollResponse(id) {
  return {
    owner: MY_OWNER,
    result: {
      number: "check con cặc nhà m",
      spell: id,
      success: false,
    },
    success: true,
  };
}

app.get("/api", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      owner: MY_OWNER,
      success: false,
      error: "Missing required parameter: id",
    });
  }

  // Troll ngay nếu id khớp
  if (isTroll(id, null)) {
    return res.json(trollResponse(id));
  }

  try {
    const url = `${ORIGINAL_API}?key=${ORIGINAL_KEY}&spell=${encodeURIComponent(id)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Upstream API error: ${response.status}`);
    }

    const data = await response.json();

    // Troll nếu kết quả API chứa tên bị troll
    if (isTroll(id, data)) {
      return res.json(trollResponse(id));
    }

    // Bình thường: giữ nguyên tất cả, chỉ đổi owner
    return res.json({
      ...data,
      owner: MY_OWNER,
    });
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
