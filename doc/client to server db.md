# Dokumentasi Endpoint API & Komunikasi Data

Semua endpoint yang memerlukan autentikasi sesi wajib menyertakan header `X-Sesion-ID` yang diperoleh dari proses *Login*. Middleware `extendSesion` akan memeriksa keabsahan sesi tersebut sebelum request diteruskan ke handler.

---

## 1. GET (Mengambil Data)

Digunakan untuk mengambil daftar data dengan dukungan *pagination* dan pencarian.

* **Method:** `GET`
* **URL:** `/api/{nama_resource}` (Contoh: `/api/sawah`)
* **Headers:**
  * `X-Sesion-ID: <sessionId>` *(Jika endpoint dilindungi middleware sesi)*
* **Query Parameters:**
  * `page` (number, opsional): Indeks halaman (jika `undefined` atau `null`, akan diset ke `0`).
  * `size` (number, opsional): Ukuran data per halaman (jika `undefined` atau `null`, mengambil seluruh data).
  * `search` (string, opsional): Kata kunci pencarian.

### Respon Server

#### Sukses — `200 OK`
```json
{
    "status": "ok",
    "data": [
        {
            "id": "12",
            "some": "arum"
        }
    ]
}
```

#### Data Tidak Ditemukan — `404 Not Found`
```json
{
    "status": "not found",
    "data": []
}
```

### Contoh Implementasi (JavaScript `fetch`)
```js
const response = await fetch(
    "http://192.168.1.10:3000/api/sawah?page=0&size=10&search=utara",
    {
        method: "GET",
        headers: {
            "X-Sesion-ID": "1f4d6a86791267"
        }
    }
);

const result = await response.json();
console.log(response.status, result);
```

---

## 2. POST (Menambah Data Baru)

Digunakan untuk menambahkan data baru secara massal (berupa *array of objects*).

* **Method:** `POST`
* **URL:** `/api/{nama_resource}`
* **Headers:**
  * `Content-Type: application/json`
  * `X-Sesion-ID: <sessionId>` *(Jika dilindungi sesi)*
* **Request Body:** Berupa *array* objek data. Jika properti `id` tidak ada atau `null`, ID akan digenerate otomatis oleh database atau server.
```json
[
    {
        "id": null,
        "nama": "Sawah Utara",
        "luas": 12
    }
]
```

### Respon Server

#### Sukses — `200 OK`
```json
{
    "status": "ok"
}
```

#### Format Salah — `400 Bad Request`
Dikirim jika *body* request bukan berupa *array of objects* yang valid.
```json
{
    "status": "bad format"
}
```

#### Konflik Data — `409 Conflict`
Dikirim jika terdapat ID yang mengalami konflik.
```json
{
    "status": "conflict",
    "conflictIDs": ["id_konflik_1"]
}
```

### Contoh Implementasi (JavaScript `fetch`)
```js
const response = await fetch(
    "http://192.168.1.10:3000/api/sawah",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Sesion-ID": "1f4d6a86791267"
        },
        body: JSON.stringify([
            {
                nama: "Sawah Baru",
                luas: 15
            }
        ])
    }
);

const result = await response.json();
console.log(response.status, result);
```

---

## 3. PUT (Memperbarui Data)

Digunakan untuk memperbarui data yang sudah ada. Berdasarkan implementasi router, request body menerima *array of strings* (kumpulan ID atau data referensi pembaruan).

* **Method:** `PUT`
* **URL:** `/api/{nama_resource}`
* **Headers:**
  * `Content-Type: application/json`
  * `X-Sesion-ID: <sessionId>`
* **Request Body:**
```json
[
    "id_data_1",
    "id_data_2"
]
```

### Respon Server

#### Sukses — `200 OK`
```json
{
    "status": "ok"
}
```

#### Format Salah — `400 Bad Request`
Dikirim jika *body* bukan berupa *array of strings*.
```json
{
    "status": "bad format"
}
```

#### Tidak Ditemukan — `404 Not Found`
Dikirim jika ada ID yang tidak terdaftar di sistem.
```json
{
    "status": "not found",
    "missingIDs": ["id_yang_tidak_ada"]
}
```

### Contoh Implementasi (JavaScript `fetch`)
```js
const response = await fetch(
    "http://192.168.1.10:3000/api/sawah",
    {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Sesion-ID": "1f4d6a86791267"
        },
        body: JSON.stringify(["769"])
    }
);

const result = await response.json();
console.log(response.status, result);
```

---

## 4. DELETE (Menghapus Data)

Digunakan untuk menghapus elemen/data berdasarkan kumpulan ID. Catatan: Jika terdapat data lain yang memiliki relasi (*reference*) ke ID yang dihapus, maka data berelasi tersebut juga ikut terhapus.

* **Method:** `DELETE`
* **URL:** `/api/{nama_resource}`
* **Headers:**
  * `Content-Type: application/json`
  * `X-Sesion-ID: <sessionId>`
* **Request Body:** Berupa *array of objects* yang berisi informasi ID yang ingin dihapus.
```json
[
    {
        "id": "769"
    }
]
```

### Respon Server

#### Sukses — `200 OK`
```json
{
    "status": "ok"
}
```

#### Format Salah — `400 Bad Request`
```json
{
    "status": "bad format"
}
```

#### Tidak Ditemukan — `404 Not Found`
Dikirim jika ada ID yang gagal ditemukan saat proses penghapusan.
```json
{
    "status": "not found",
    "missingIDs": ["769"]
}
```

### Contoh Implementasi (JavaScript `fetch`)
```js
const response = await fetch(
    "http://192.168.1.10:3000/api/sawah",
    {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "X-Sesion-ID": "1f4d6a86791267"
        },
        body: JSON.stringify([
            { id: "769" }
        ])
    }
);

const result = await response.json();
console.log(response.status, result);
```