require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User, Product } = require("../models");

const SALT_ROUNDS = 10;

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil");
    await sequelize.sync();

    const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);
    const [user] = await User.findOrCreate({
      where: { username: "admin" },
      defaults: { email: "admin@example.com", password: hashedPassword },
    });
    console.log("User siap:", user.username);

    const existingProducts = await Product.count();
    if (existingProducts === 0) {
      await Product.bulkCreate([
        {
          name: "Kaos Polos Cotton Combed",
          description: "Bahan adem, cocok sehari-hari",
          price: 75000,
          stock: 50,
        },
        {
          name: "Kemeja Flanel",
          description: "Motif kotak-kotak, bahan tebal",
          price: 150000,
          stock: 20,
        },
        {
          name: "Celana Chino Slim Fit",
          description: "Warna khaki, bahan stretch",
          price: 180000,
          stock: 15,
        },
        {
          name: "Sepatu Sneakers Canvas",
          description: "Cocok buat kasual",
          price: 220000,
          stock: 30,
        },
        {
          // sengaja: produk ini buat demo STORED XSS. Di halaman /search (aman),
          // ini bakal tampil sebagai TEKS BIASA (escaped). Di /search-unsafe-demo
          // (kalo diaktifin), payload ini bakal KEEKSEKUSI beneran di browser.
          name: '<script>alert("Stored XSS dari nama produk")</script>',
          description:
            "Produk ini sengaja dibikin buat demo stored XSS, liat README",
          price: 50000,
          stock: 5,
        },
      ]);
      console.log(
        "Produk dummy berhasil ditambahin (termasuk 1 produk demo XSS)",
      );
    } else {
      console.log("Produk udah ada, skip supaya gak dobel");
    }

    console.log("\nSeeding selesai ✅");
    console.log("Login pake: username=admin password=password123");
    process.exit(0);
  } catch (err) {
    console.error("Gagal seeding:", err.message);
    process.exit(1);
  }
}

seed();
