const fs = require("fs");
const express = require("express");

const app = express();
const PORT = 8000;

app.use(express.json()); // Middleware untuk membaca JSON dari body request

const customers = JSON.parse(fs.readFileSync(`${__dirname}/data/dummy.json`)); // Membaca data pelanggan dari file JSON

// Menampilkan halaman beranda
app.get("/", (req, res) => {
  res.send("<p>Hallo FSW 1 TERCINTA</p>");
});

// API untuk mendapatkan data pelanggan berdasarkan ID
app.get("/api/v1/customers/:id", (req, res) => {
  const id = req.params.id;
  const customer = customers.find((cust) => cust._id === id); // Mencari pelanggan berdasarkan ID

  if (!customer) {
    return res.status(404).json({
      status: "fail",
      message: `Customer dengan id ${id} tidak ditemukan`,
    });
  }

  res.status(200).json({
    status: "success",
    data: { customer },
  });
});

// API untuk memperbarui data pelanggan
app.patch("/api/v1/customers/:id", (req, res) => {
  const id = req.params.id;
  const customerIndex = customers.findIndex((cust) => cust._id === id);

  if (customerIndex === -1) {
    return res.status(404).json({
      status: "fail",
      message: `Customer dengan id ${id} tidak ditemukan`,
    });
  }

  customers[customerIndex] = { ...customers[customerIndex], ...req.body }; // Menggabungkan data pelanggan yang ada dengan data yang diterima dari body request

  // Menyimpan perubahan ke dalam file JSON
  fs.writeFile(`${__dirname}/data/dummy.json`, JSON.stringify(customers), (err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Gagal menyimpan data.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Berhasil update data",
      data: { customer: customers[customerIndex] },
    });
  });
});

// API untuk menambahkan data pelanggan baru
app.post("/api/v1/customers", (req, res) => {
  customers.push(req.body); // Menambahkan data pelanggan baru ke dalam array customers

  // Menyimpan perubahan ke dalam file JSON
  fs.writeFile(`${__dirname}/data/dummy.json`, JSON.stringify(customers), (err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Gagal menyimpan data.",
      });
    }

    res.status(201).json({
      status: "success",
      data: { customer: req.body },
    });
  });
});

// API untuk menghapus data pelanggan berdasarkan ID
app.delete("/api/v1/customers/:id", (req, res) => {
  const id = req.params.id;
  const customerIndex = customers.findIndex((cust) => cust._id === id);

  if (customerIndex === -1) {
    return res.status(404).json({
      status: "fail",
      message: `Customer dengan id ${id} tidak ditemukan`,
    });
  }

  const deletedCustomer = customers.splice(customerIndex, 1)[0]; // Menghapus pelanggan dari array

  // Menyimpan perubahan ke dalam file JSON
  fs.writeFile(`${__dirname}/data/dummy.json`, JSON.stringify(customers), (err) => {
    if (err) {
      customers.splice(customerIndex, 0, deletedCustomer); // Mengembalikan pelanggan yang dihapus ke dalam array jika terjadi kesalahan saat penyimpanan
      return res.status(500).json({
        status: "error",
        message: "Gagal menyimpan data.",
      });
    }

    res.status(200).json({
      status: "success",
      message: `Berhasil menghapus data pelanggan dengan ID ${id}`,
      data: { customer: deletedCustomer },
    });
  });
});

// API untuk mendapatkan semua data pelanggan
app.get("/api/v1/customers", (req, res) => {
  res.status(200).json({
    status: "success",
    totalData: customers.length,
    data: { customers },
  });
});

// Menjalankan server pada port yang ditentukan
app.listen(PORT, () => {
  console.log(`App running on port : ${PORT}`);
});
