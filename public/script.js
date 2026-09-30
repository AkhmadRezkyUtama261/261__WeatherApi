// Client-Side Geolocation Fetch Handler
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-lokasi");
    const inputLokasi = document.getElementById("input-lokasi");
    const statusContainer = document.getElementById("status-container");
    const statusText = document.getElementById("status-text");
    const currentBadge = document.getElementById("current-badge");
    const sourceBadge = document.getElementById("source-badge");
    const tagButtons = document.querySelectorAll(".tag-btn");
    const customApiKeyInput = document.getElementById("custom-api-key");
    const btnSimpanKey = document.getElementById("btn-simpan-key");

    // Load API Key dari localStorage jika ada
    let storedKey = localStorage.getItem("maptiler_custom_key") || "";
    if (storedKey && customApiKeyInput) {
        customApiKeyInput.value = storedKey;
    }

    if (btnSimpanKey && customApiKeyInput) {
        btnSimpanKey.addEventListener("click", () => {
            const keyVal = customApiKeyInput.value.trim();
            if (keyVal) {
                localStorage.setItem("maptiler_custom_key", keyVal);
                alert("API Key tersimpan! Sekarang pencarian akan memprioritaskan key ini.");
            } else {
                localStorage.removeItem("maptiler_custom_key");
                alert("API Key dihapus. Sistem akan menggunakan mode live geocoding otomatis.");
            }
            fetchLokasiData(inputLokasi.value || "Jakarta");
        });
    }

    // Output Elements
    const hasilNegara = document.getElementById("hasil-negara");
    const hasilProvinsi = document.getElementById("hasil-provinsi");
    const hasilKecamatan = document.getElementById("hasil-kecamatan");
    const hasilLongitude = document.getElementById("hasil-longitude");
    const hasilLatitude = document.getElementById("hasil-latitude");

    // Fungsi Fetch Geolocation dari Endpoint Backend
    async function fetchLokasiData(namaKota) {
        const query = (namaKota || "").trim();
        if (!query) return;

        // Tampilkan loading spinner
        statusContainer.classList.remove("hidden");
        statusText.textContent = `Mengambil data geolocation untuk "${query}"...`;
        statusContainer.style.color = "var(--primary)";

        try {
            const activeKey = customApiKeyInput ? customApiKeyInput.value.trim() : "";
            let url = `/api/lokasi?kota=${encodeURIComponent(query)}`;
            if (activeKey) {
                url += `&key=${encodeURIComponent(activeKey)}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Server status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Data Geolocation Diterima:", data);

            // Update UI dengan data yang diterima
            currentBadge.textContent = data.lokasi || query;
            hasilNegara.textContent = data.negara || "-";
            hasilProvinsi.textContent = data.provinsi || "-";
            hasilKecamatan.textContent = data.kecamatan || "-";
            hasilLongitude.textContent = typeof data.longitude === "number" ? data.longitude.toFixed(6) : data.longitude;
            hasilLatitude.textContent = typeof data.latitude === "number" ? data.latitude.toFixed(6) : data.latitude;

            if (sourceBadge) {
                if (data.source === "maptiler") {
                    sourceBadge.textContent = "MapTiler Cloud API";
                    sourceBadge.style.color = "#059669";
                    sourceBadge.style.background = "#ecfdf5";
                } else {
                    sourceBadge.textContent = "Live Geocoding API";
                    sourceBadge.style.color = "#4f46e5";
                    sourceBadge.style.background = "#eef2ff";
                }
            }

            // Sembunyikan loading
            statusContainer.classList.add("hidden");
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            statusText.textContent = "Gagal memuat data lokasi. Silakan coba lagi.";
            statusContainer.style.color = "#dc2626";
            setTimeout(() => {
                statusContainer.classList.add("hidden");
            }, 3000);
        }
    }

    // Event Submit Form
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const kota = inputLokasi.value;
        fetchLokasiData(kota);
    });

    // Event Klik Rekomendasi Tag
    tagButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const kota = btn.getAttribute("data-city");
            inputLokasi.value = kota;
            fetchLokasiData(kota);
        });
    });

    // Inisialisasi awal saat halaman dibuka
    fetchLokasiData(inputLokasi.value || "Jakarta");
});
