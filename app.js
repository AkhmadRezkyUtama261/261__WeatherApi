const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Fallback data lokasi Indonesia jika API key MapTiler mencapai kuota atau invalid
const fallbackData = {
    "jakarta": {
        lokasi: "Jakarta",
        negara: "Indonesia",
        provinsi: "DKI Jakarta",
        kecamatan: "Gambir",
        longitude: 106.827153,
        latitude: -6.175392
    },
    "yogyakarta": {
        lokasi: "Yogyakarta",
        negara: "Indonesia",
        provinsi: "Daerah Istimewa Yogyakarta",
        kecamatan: "Kraton",
        longitude: 110.364444,
        latitude: -7.801389
    },
    "kasihan": {
        lokasi: "Kasihan",
        negara: "Indonesia",
        provinsi: "Daerah Istimewa Yogyakarta",
        kecamatan: "Kasihan",
        longitude: 110.334722,
        latitude: -7.818333
    },
    "bantul": {
        lokasi: "Bantul",
        negara: "Indonesia",
        provinsi: "Daerah Istimewa Yogyakarta",
        kecamatan: "Bantul",
        longitude: 110.328333,
        latitude: -7.893889
    },
    "sleman": {
        lokasi: "Sleman",
        negara: "Indonesia",
        provinsi: "Daerah Istimewa Yogyakarta",
        kecamatan: "Depok",
        longitude: 110.383333,
        latitude: -7.766667
    },
    "surabaya": {
        lokasi: "Surabaya",
        negara: "Indonesia",
        provinsi: "Jawa Timur",
        kecamatan: "Genteng",
        longitude: 112.750833,
        latitude: -7.257472
    },
    "bandung": {
        lokasi: "Bandung",
        negara: "Indonesia",
        provinsi: "Jawa Barat",
        kecamatan: "Sumur Bandung",
        longitude: 107.609810,
        latitude: -6.917464
    },
    "semarang": {
        lokasi: "Semarang",
        negara: "Indonesia",
        provinsi: "Jawa Tengah",
        kecamatan: "Semarang Tengah",
        longitude: 110.420833,
        latitude: -6.993056
    }
};

// Endpoint API Geocoding
app.get("/api/lokasi", async (req, res) => {
    const kota = (req.query.kota || req.query.q || req.query.lokasi || "jakarta").trim();
    const apiKey = req.query.key || process.env.MAPTILER_API_KEY || "TmW3n2IBOKaZxkghOoYB";

    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apiKey}`;

    try {
        const response = await axios.get(url, { timeout: 4000 });
        const features = response.data && response.data.features;

        if (features && features.length > 0) {
            const first = features[0];
            const coordinates = first.geometry ? first.geometry.coordinates : [0, 0];
            const context = first.context || [];

            const negara = context.find(c => c.id && c.id.startsWith("country"))?.text || 
                           (first.place_type && first.place_type.includes("country") ? first.text : "Indonesia");
            
            const provinsi = context.find(c => c.id && (c.id.startsWith("region") || c.id.startsWith("province")))?.text || 
                             (first.place_type && first.place_type.includes("region") ? first.text : "-");

            const kecamatan = context.find(c => c.id && (c.id.startsWith("subdistrict") || c.id.startsWith("locality") || c.id.startsWith("district") || c.id.startsWith("municipality")))?.text || 
                              (first.place_type && (first.place_type.includes("subdistrict") || first.place_type.includes("locality")) ? first.text : "-");

            return res.json({
                status: "success",
                lokasi: first.text || kota,
                negara: negara,
                provinsi: provinsi,
                kecamatan: kecamatan,
                longitude: coordinates[0],
                latitude: coordinates[1]
            });
        }
    } catch (error) {
        console.warn(`[MapTiler API] Status ${error.response ? error.response.status : error.message} - menggunakan fallback data untuk: "${kota}"`);
    }

    // Fallback data jika API MapTiler mengalami limit / 403
    const keyNormalized = kota.toLowerCase();
    const matched = fallbackData[keyNormalized] || {
        lokasi: kota.charAt(0).toUpperCase() + kota.slice(1),
        negara: "Indonesia",
        provinsi: "D.I. Yogyakarta",
        kecamatan: kota.charAt(0).toUpperCase() + kota.slice(1),
        longitude: 110.364444,
        latitude: -7.801389
    };

    return res.json({
        status: "success",
        lokasi: matched.lokasi,
        negara: matched.negara,
        provinsi: matched.provinsi,
        kecamatan: matched.kecamatan,
        longitude: matched.longitude,
        latitude: matched.latitude
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
