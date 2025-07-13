const db = require("./src/config/database");

async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database...");

    await db.initTables();

    console.log("✅ Database initialized successfully");

    // Insert sample data
    await insertSampleData();

    console.log("🎉 Database setup complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

async function insertSampleData() {
  try {
    // Check if admin user exists
    const adminExists = await db.query(
      "SELECT id FROM users WHERE email = $1",
      ["admin@appunture.com"]
    );

    if (adminExists.rows.length === 0) {
      const bcrypt = require("bcryptjs");
      const adminPassword = await bcrypt.hash("admin123", 10);

      await db.query(
        `
        INSERT INTO users (email, password_hash, name, profession, role)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          "admin@appunture.com",
          adminPassword,
          "Admin User",
          "Administrator",
          "admin",
        ]
      );

      console.log(
        "✅ Admin user created (email: admin@appunture.com, password: admin123)"
      );
    }

    // Insert sample points
    const pointsCount = await db.query("SELECT COUNT(*) FROM points");

    if (parseInt(pointsCount.rows[0].count) === 0) {
      const samplePoints = [
        {
          code: "LI4",
          name: "Hegu",
          chinese_name: "合谷",
          meridian: "Large Intestine",
          location:
            "On the back of the hand, between the 1st and 2nd metacarpal bones",
          indications: "Headache, facial pain, toothache, stress relief",
          contraindications: "Pregnancy (strong stimulation)",
          coordinates: JSON.stringify({ x: 150, y: 200 }),
        },
        {
          code: "ST36",
          name: "Zusanli",
          chinese_name: "足三里",
          meridian: "Stomach",
          location: "Below the knee, lateral to the tibia",
          indications: "Digestive issues, immune system boost, fatigue",
          contraindications: "None major",
          coordinates: JSON.stringify({ x: 100, y: 400 }),
        },
        {
          code: "GV20",
          name: "Baihui",
          chinese_name: "百会",
          meridian: "Governing Vessel",
          location:
            "Top of the head, at the intersection of the midline and the line connecting the ears",
          indications:
            "Mental clarity, headache, dizziness, memory enhancement",
          contraindications: "None major",
          coordinates: JSON.stringify({ x: 200, y: 50 }),
        },
      ];

      for (const point of samplePoints) {
        await db.query(
          `
          INSERT INTO points (code, name, chinese_name, meridian, location, indications, contraindications, coordinates)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            point.code,
            point.name,
            point.chinese_name,
            point.meridian,
            point.location,
            point.indications,
            point.contraindications,
            point.coordinates,
          ]
        );
      }

      console.log("✅ Sample acupuncture points inserted");
    }

    // Insert sample symptoms
    const symptomsCount = await db.query("SELECT COUNT(*) FROM symptoms");

    if (parseInt(symptomsCount.rows[0].count) === 0) {
      const sampleSymptoms = [
        {
          name: "Headache",
          description: "Pain in the head or upper neck",
          category: "Pain",
        },
        {
          name: "Nausea",
          description: "Feeling of sickness in the stomach",
          category: "Digestive",
        },
        {
          name: "Insomnia",
          description: "Difficulty falling or staying asleep",
          category: "Sleep",
        },
        {
          name: "Anxiety",
          description: "Feeling of worry or unease",
          category: "Mental Health",
        },
        {
          name: "Back Pain",
          description: "Pain in the back area",
          category: "Pain",
        },
        {
          name: "Fatigue",
          description: "Extreme tiredness",
          category: "General",
        },
      ];

      for (const symptom of sampleSymptoms) {
        await db.query(
          `
          INSERT INTO symptoms (name, description, category)
          VALUES ($1, $2, $3)
        `,
          [symptom.name, symptom.description, symptom.category]
        );
      }

      console.log("✅ Sample symptoms inserted");
    }
  } catch (error) {
    console.error("Error inserting sample data:", error);
  }
}

// Run initialization
initializeDatabase();
