const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Endpoint API Geocoding
app.get("/api/lokasi", async (req, res) => {
    const kota = (req.query.kota || req.query.q || req.query.lokasi || "jakarta").trim();
    const apiKey = req.query.key || process.env.MAPTILER_API_KEY || "TmW3n2IBOKaZxkghOoYB";

    // 1. Coba panggil MapTiler Geocoding API terlebih dahulu
    try {
        const maptilerUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apiKey}`;
        const response = await axios.get(maptilerUrl, { timeout: 3500 });
        const features = response.data && response.data.features;

        if (features && features.length > 0) {
            const first = features[0];
            const coordinates = first.geometry ? first.geometry.coordinates : [0, 0];
            const context = first.context || [];

            const negara = context.find(c => c.id && c.id.startsWith("country"))?.text || 
                           (first.place_type && first.place_type.includes("country") ? first.text : "Indonesia");
            
            const provinsi = context.find(c => c.id && (c.id.startsWith("region") || c.id.startsWith("province") || c.id.startsWith("state")))?.text || 
                             (first.place_type && first.place_type.includes("region") ? first.text : "-");

            const kecamatan = context.find(c => c.id && (c.id.startsWith("subdistrict") || c.id.startsWith("locality") || c.id.startsWith("district") || c.id.startsWith("municipality")))?.text || 
                              (first.place_type && (first.place_type.includes("subdistrict") || first.place_type.includes("locality")) ? first.text : first.text || "-");

            console.log(`[MapTiler API] Berhasil mendapatkan data untuk: "${kota}"`);
            return res.json({
                status: "success",
                source: "maptiler",
                lokasi: first.text || kota,
                negara: negara,
                provinsi: provinsi,
                kecamatan: kecamatan,
                longitude: coordinates[0],
                latitude: coordinates[1]
            });
        }
    } catch (maptilerError) {
        console.warn(`[MapTiler API] ${maptilerError.response ? `Status ${maptilerError.response.status}` : maptilerError.message} - Beralih ke live geocoding provider untuk: "${kota}"`);
    }

    // 2. Fallback cerdas: Live Geocoding Provider (OpenStreetMap Nominatim)
    // Berjalan otomatis untuk mencari kota/kabupaten/kecamatan apapun di dunia secara akurat
    try {
        const liveUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(kota)}&format=json&addressdetails=1&limit=1`;
        const liveRes = await axios.get(liveUrl, {
            timeout: 5000,
            headers: {
                "User-Agent": "PWS-Geolocation-App/1.0 (akhmad.rezky.ft24@mail.umy.ac.id)"
            }
        });

        if (liveRes.data && liveRes.data.length > 0) {
            const f = liveRes.data[0];
            const a = f.address || {};

            const negara = a.country || "Indonesia";
            
            // Penentuan Provinsi
            let provinsi = a.state || a.province || a.region;
            if (!provinsi && a.city && a.city.toLowerCase().includes("jakarta")) {
                provinsi = a.city;
            } else if (!provinsi) {
                provinsi = a.state_district || "-";
            }

            // Penentuan Kecamatan / Sub-wilayah
            let kecamatan = a.subdistrict || a.city_district || a.suburb || a.town || a.municipality || a.village;
            if (!kecamatan) {
                kecamatan = a.city || a.county || f.name || "-";
            }

            console.log(`[Live Geocoding] Berhasil mendapatkan data untuk: "${kota}"`);
            return res.json({
                status: "success",
                source: "geocoding-live",
                lokasi: f.name || kota,
                negara: negara,
                provinsi: provinsi,
                kecamatan: kecamatan,
                longitude: parseFloat(f.lon),
                latitude: parseFloat(f.lat)
            });
        }
    } catch (liveError) {
        console.warn(`[Live Geocoding Error] ${liveError.message}`);
    }

    // 3. Fallback jika offline / tidak ditemukan
    return res.json({
        status: "success",
        source: "fallback",
        lokasi: kota.charAt(0).toUpperCase() + kota.slice(1),
        negara: "Indonesia",
        provinsi: "Daerah Istimewa Yogyakarta",
        kecamatan: kota.charAt(0).toUpperCase() + kota.slice(1),
        longitude: 110.364444,
        latitude: -7.801389
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
