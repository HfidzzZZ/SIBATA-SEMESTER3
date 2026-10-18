# How to Send Packet

## Example

```js
const response = await fetch(
    "http://192.168.1.10:3000/api/sawah/10?force=false",
    {
        method: "PUT",

        headers: {
            "Content-Type": "application/json",
            "X-Sesion-ID": "1f4d6a86791267"
        },

        body: JSON.stringify({
            nama: "Sawah Utara",
            id_wilayah: 2
        })
    }
);

const result = await response.json();

console.log(response.status, result);
```

## Note

* `X-Sesion-ID` harus diisi dengan ID sesi yang dikirimkan server saat login.
* `Content-Type: application/json` digunakan untuk mengirim request body dalam format JSON.
* `response.status` berisi HTTP status code dari server.
* `response.json()` membaca response body sebagai objek JavaScript.
* Endpoint yang menggunakan middleware `extendSesion` harus menyertakan `X-Sesion-ID` pada request header.

---

# Login

## Client to Server

* **Method:** `POST`
* **URL:** `/api/login`
* **Headers:**

  * `Content-Type: application/json`
* **Body:**

```json
{
    "name": "username",
    "password": "password"
}
```

## Server to Client

### Success — `200 OK`

```json
{
    "status": "ok",
    "seesionId": "1f4d6a86791267"
}
```

`seesionId` adalah ID sesi yang dibuat server dan digunakan untuk mengakses endpoint yang membutuhkan autentikasi.

### Invalid Request — `400 Bad Request`

```json
{
    "status": "unknown format"
}
```

Dikirim jika `name` atau `password` tidak tersedia pada request body.

### Authentication Failed — `401 Unauthorized`

```json
{
    "status": "incorrect password or name"
}
```

Dikirim jika username atau password tidak valid.

## Example

```js
const response = await fetch(
    "http://192.168.1.10:3000/api/login",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: "username",
            password: "password"
        })
    }
);

const result = await response.json();

if (response.ok) {
    const sessionId = result.seesionId;
    console.log("Login successful:", sessionId);
} else {
    console.log("Login failed:", response.status, result);
}
```

---

# Extend Session

Memperpanjang masa berlaku sesi pengguna yang masih terdaftar dan belum kedaluwarsa.

## Client to Server

* **Method:** `POST` .
* **URL:** `/api/extendSesion` .
* **Headers:**

  * `Content-Type: application/json`
* **Body:**

```json
{
    "sesionId": "1f4d6a86791267"
}
```

## Server to Client

### Success — `200 OK`

```json
{
    "status": "ok"
}
```

### Session Invalid — `401 Unauthorized`

```json
{
    "status": "sesion expired or unregistered"
}
```

## Example

```js
const response = await fetch(
    "http://192.168.1.10:3000/api/extend-session",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sesionId: sessionId
        })
    }
);

const result = await response.json();

console.log(response.status, result);
```

---

# Session Middleware

Middleware `extendSesion` memeriksa ID sesi dari request header sebelum request diteruskan ke handler berikutnya.

## Client to Server

* **Headers:**

  * `X-Sesion-ID: <sessionId>`

Request body dan URL mengikuti kebutuhan endpoint yang diakses.

## Server Behavior

### Session Valid

Jika sesi valid, server memanggil `next()` untuk meneruskan request ke middleware atau handler berikutnya.

### Session Invalid — `401 Unauthorized`

```json
{
    "status": "sesion expired or unregistered"
}
```

Request dihentikan dan handler berikutnya tidak dijalankan.

## Example

```js
const response = await fetch(
    "http://192.168.1.10:3000/api/{terusan}",
    {
        method: "GET",

        headers: {
            "X-Sesion-ID": sessionId
        }
    }
);

const result = await response.json();

console.log(response.status, result);
```

---

# Logout

Menghapus sesi pengguna yang diberikan melalui request body.

## Client to Server

* **Method:** `POST` (sesuaikan dengan method yang didaftarkan pada router).
* **URL:** `/api/logout` (sesuaikan dengan route yang digunakan).
* **Headers:**

  * `Content-Type: application/json`
* **Body:**

```json
{
    "sesionId": "1f4d6a86791267"
}
```

## Server to Client

### Success — `200 OK`

```json
{
    "status": "ok"
}
```

### Session Invalid — `401 Unauthorized`

```json
{
    "status": "sesion expired or unregistered"
}
```

## Example

```js
const response = await fetch(
    "http://192.168.1.10:3000/api/logout",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sesionId: sessionId
        })
    }
);

const result = await response.json();

console.log(response.status, result);
```
