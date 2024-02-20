const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const pdfkit = require("pdfkit");
const path = require("path");

const app = express();
const PORT = 3000;
app.use(cors());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "GroceryOrder",
  waitForConnections: true,
  queueLimit: 0,
});

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const frontEndPath = path.join(__dirname, "front-end");

app.get("/", (req, res) => {
  res.sendFile(path.join(frontEndPath, "index.html"));
});

app.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Products");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM Products WHERE product_id = ?",
      [productId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/products", async (req, res) => {
  const { product_id, product_name, price, category_id, supplier_id } =
    req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO Products (product_id, product_name, price, category_id, supplier_id) VALUES (?, ?, ?, ?, ?)",
      [product_id, product_name, price, category_id, supplier_id]
    );

    // const productId = result.insertId;
    res
      .status(201)
      .json({ id: product_id, message: "Product created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const { product_name, price, category_id, supplier_id } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE Products SET product_name = ?, price = ?, category_id = ?, supplier_id = ? WHERE product_id = ?",
      [product_name, price, category_id, supplier_id, productId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json({ message: "Product updated successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const [result] = await pool.query(
      "DELETE FROM Products WHERE product_id = ?",
      [productId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json({ message: "Product deleted successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/download-pdf", async (req, res) => {
  try {
    const connection = await pool.getConnection(); // Get a connection from the pool
    const [products] = await connection.query("SELECT * FROM Products");

    const doc = new pdfkit();
    let pdfData = Buffer.from([]);

    // Set the content type to "application/pdf"
    res.setHeader("Content-Type", "application/pdf");

    // Display the PDF in a new tab instead of triggering a download
    res.setHeader(
      "Content-Disposition",
      "inline; filename=GreenGrocer_Invoice.pdf"
    );

    doc.on("data", (chunk) => {
      pdfData = Buffer.concat([pdfData, chunk]);
    });

    doc.on("end", () => {
      // Send the PDF data as the response
      res.send(pdfData);
    });

    doc.unit = "mm";

    const borderWidth = 5; // Specify the width of the border
    doc
      .rect(0, 0, doc.page.width, doc.page.height)
      .stroke({ width: borderWidth });

    doc.moveDown(6);
    // Add header information (align left)
    doc.text("Green Grocers", 30, 10);
    doc.moveDown(2); // Add larger break after each line
    doc.text("298 Hemlock Street, Waterloo,", 30, 30);
    doc.text("Ontario, Canada, N2J0B7", 30, 50);
    doc.moveDown(2);
    doc.text("Phone: 564-525-1674", 30, 70);
    doc.moveDown(2);
    doc.text("Email: admin@greengrocer.com", 30, 90);
    doc.moveDown(2);
    doc.text("Website: greengrocer.com", 30, 110);

    // Add billing information (align right)
    doc.moveDown(4); // Add larger breaks
    doc.text("Bill To: Sathwika Yelamoni", 160, 10, { align: "right" });
    doc.moveDown(2);
    doc.text("Client Name: Sudhamsh", 160, 30, {
      align: "right",
    });
    doc.moveDown(2);
    doc.text("307 Lakeview Street", 140, 50, { align: "right" });
    doc.moveDown(2);
    doc.text("Ontario, Ontario N2KH67", 140, 70, { align: "right" });

    doc.image("logo.png", 240, 120, { width: 100, height: 100 });
    doc.fontSize(24);
    doc.text("Green Grocers", 30, 220, { align: "center", bold: true });
    doc.fontSize(12);

    // Add invoice title and number
    doc.moveDown(4); // Add larger breaks
    doc.text("INVOICE", 10, 260, { align: "right" });
    doc.moveDown(2);
    doc.text("INVOICE NUMBER: 4556875891", 10, 280, { align: "right" });
    doc.fontSize(12);

    // Add product details
    doc.moveDown(4); // Add larger breaks
    products.forEach((product, index) => {
      doc.text(`${index + 1}. ${product.product_name} - $${product.price}`, 30);
      doc.moveDown(2);
    });
    doc.moveDown(6);
    let total = 0;
    products.forEach((product) => {
      let i = parseInt(product.price);
      total += i;
    });

    doc.moveDown(6);
    doc.fontSize(28);
    doc.text(`Total: $${total}`, 10, 600, { align: "right" });
    doc.fontSize(12);

    doc.end(); // end the document
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
