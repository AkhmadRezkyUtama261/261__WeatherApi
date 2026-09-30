// Client-Side Geolocation Fetch Handler
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-lokasi");
    const inputLokasi = document.getElementById("input-lokasi");
    const statusContainer = document.getElementById("status-container");
    const statusText = document.getElementById("status-text");
    const currentBadge = document.getElementById("current-badge");
    const tagButtons = document.querySelectorAll(".tag-btn");

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
            const response = await fetch(`/api/lokasi?kota=${encodeURIComponent(query)}`);
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
