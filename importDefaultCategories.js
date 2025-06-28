const db = require("./config/db");

const defaultCategories = [
  { name: "Ăn uống", color_id: "eat_icon_red" },
  { name: "Lương", color_id: "salary_icon_green" },
  { name: "Xăng", color_id: "fuel_icon_blue" },
  { name: "Tiền nhà", color_id: "home_icon_gold" },
];

async function importCategories() {
  try {
    for (const category of defaultCategories) {
      const [iconRows] = await db.query(
        "SELECT icon_id FROM icons WHERE color_id = ?",
        [category.color_id]
      );
      if (iconRows.length === 0) {
        console.error(`Icon with color_id '${category.color_id}' not found.`);
        continue;
      }

      const icon_id = iconRows[0].icon_id;

      await db.query(
        "INSERT INTO categories (name, icon_id, is_default) VALUES (?, ?, 1)",
        [category.name, icon_id]
      );

      console.log(`Inserted category: ${category.name}`);
    }

    console.log("All default categories imported.");
    process.exit(0);
  } catch (err) {
    console.error("Error importing categories:", err.message);
    process.exit(1);
  }
}

importCategories();
