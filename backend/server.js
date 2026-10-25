
import app from "./app.js";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`MasterPath API running on port ${PORT}`);
});
