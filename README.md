# Praktikum Web Service (PWS) - Pertemuan 3
## Geolocation & WeatherAPI Interface (MapTiler Geocoding)

Proyek ini dibuat untuk memenuhi tugas mata kuliah **Praktikum Web Service (PWS)** Pertemuan 3. Proyek mengintegrasikan antarmuka HTML interaktif dengan backend Express.js untuk mengambil dan menampilkan data Geolocation / Geocoding dari [MapTiler Cloud API](https://api.maptiler.com/).

---

### Identitas Mahasiswa
* **Nama** : Akhmad Rezky Utama
* **NIM**  : 20240140261
* **Kelas**: Praktikum Web Service (PWS)

---

### Fitur dan Data yang Ditampilkan
Interface web menampilkan data geolocation secara dinamis sesuai spesifikasi tugas:
1. **Lokasi** (`<input>`): Input teks dinamis pencarian kota/kecamatan beserta tombol tag cepat.
2. **Negara**: Menampilkan nama negara (contoh: *Indonesia*).
3. **Provinsi**: Menampilkan provinsi/wilayah (contoh: *DKI Jakarta*, *Daerah Istimewa Yogyakarta*).
4. **Kecamatan**: Menampilkan kecamatan/distrik (contoh: *Gambir*, *Kasihan*, *Bantul*).
5. **Longitude**: Koordinat garis bujur lokasi.
6. **Latitude**: Koordinat garis lintang lokasi.

---

### Cara Menjalankan di VS Code / Terminal Lokal

1. **Buka Terminal di direktori proyek**:
   ```bash
   cd "d:\Downloads\Semester 5\PWS\Pert3PWS"
   ```

2. **Jalankan Server Node.js**:
   ```bash
   node app.js
   ```
   Server akan berjalan pada:
   ```
   http://localhost:3000
   ```

3. **Buka di Browser**:
   * **Antarmuka Web**: [http://localhost:3000](http://localhost:3000)
   * **Direct API Test (Browser / Postman)**: [http://localhost:3000/api/lokasi?kota=Jakarta](http://localhost:3000/api/lokasi?kota=Jakarta)

---

### Pengujian API di Postman / Browser (GET)

* **Method**: `GET`
* **URL**: `http://localhost:3000/api/lokasi?kota=Jakarta`
* **Parameter Query**:
  * `kota` (opsional, default: `jakarta`) : Nama kota/kecamatan yang ingin dicari (contoh: `jakarta`, `yogyakarta`, `kasihan`, `bantul`).

#### Contoh Response JSON (200 OK):
```json
{
  "status": "success",
  "lokasi": "Jakarta",
  "negara": "Indonesia",
  "provinsi": "DKI Jakarta",
  "kecamatan": "Gambir",
  "longitude": 106.827153,
  "latitude": -6.175392
}
```

---

### Link Repository GitHub
* **URL Repository**: [https://github.com/AkhmadRezkyUtama261/261__WeatherApi](https://github.com/AkhmadRezkyUtama261/261__WeatherApi)
