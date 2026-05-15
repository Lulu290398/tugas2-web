// tracking-app.js — logika Vue untuk tracking.html

new Vue({
  el: '#app',

  data: {
    // Ambil dari shared data (dataBahanAjar.js), bukan app.$data
    pengirimanList: pengirimanList,
    paket: paketList,
    tracking: Object.assign({}, trackingAwal),

    selectedPaket: '',
    errorMessage: '',

    form: {
      nomorDO: '',
      nim: '',
      nama: '',
      ekspedisi: '',
      tanggalKirim: new Date().toISOString().substr(0, 10),
      total: 0
    }
  },

  computed: {
    // Detail paket yang dipilih (untuk menampilkan isi paket)
    detailPaket: function() {
      return this.paket.find(function(p) {
        return p.kode === this.selectedPaket;
      }.bind(this)) || null;
    }
  },

  methods: {
    // Generate nomor DO otomatis: DO{tahun}-{sequence 4 digit}
    generateDO: function() {
      var tahun = new Date().getFullYear();
      var jumlah = Object.keys(this.tracking).length + 1;
      var nomor = String(jumlah).padStart(3, '0');
      return 'DO' + tahun + '-' + nomor;
    },

    // Tambah tracking baru
    tambahTracking: function() {
      if (!this.form.nim) {
        this.errorMessage = 'NIM wajib diisi!';
        return;
      }
      if (this.form.nim.length < 9) {
        this.errorMessage = 'NIM minimal 9 digit!';
        return;
      }
      if (!this.form.nama) {
        this.errorMessage = 'Nama wajib diisi!';
        return;
      }
      if (!this.form.ekspedisi) {
        this.errorMessage = 'Pilih ekspedisi terlebih dahulu!';
        return;
      }
      if (!this.selectedPaket) {
        this.errorMessage = 'Pilih paket bahan ajar terlebih dahulu!';
        return;
      }
      if (!this.form.tanggalKirim) {
        this.errorMessage = 'Tanggal kirim wajib diisi!';
        return;
      }

      // Tambah DO baru ke object tracking
      // Harus pakai Vue.set agar reaktif pada Vue 2
      Vue.set(this.tracking, this.form.nomorDO, {
        nim: this.form.nim,
        nama: this.form.nama,
        status: 'Diproses',
        ekspedisi: this.form.ekspedisi,
        tanggalKirim: this.form.tanggalKirim,
        paket: this.selectedPaket,
        total: this.form.total,
        perjalanan: [
          {
            waktu: new Date().toLocaleString('id-ID'),
            keterangan: 'Delivery Order berhasil dibuat'
          }
        ]
      });

      this.errorMessage = '';
      this.selectedPaket = '';

      // Reset form dan generate nomor DO baru
      this.form = {
        nomorDO: this.generateDO(),
        nim: '',
        nama: '',
        ekspedisi: '',
        tanggalKirim: new Date().toISOString().substr(0, 10),
        total: 0
      };
    },

    // Format rupiah
    formatRupiah: function(angka) {
      return 'Rp ' + Number(angka).toLocaleString('id-ID');
    }
  },

  watch: {
    // Watcher 1: Update total harga otomatis saat paket dipilih
    selectedPaket: function(value) {
      var data = this.paket.find(function(p) { return p.kode === value; });
      if (data) {
        this.form.total = data.harga;
      } else {
        this.form.total = 0;
      }
    },

    // Watcher 2: Validasi NIM minimal 9 digit
    'form.nim': function(value) {
      if (value.length > 0 && value.length < 9) {
        this.errorMessage = 'NIM minimal 9 digit!';
      } else {
        this.errorMessage = '';
      }
    }
  },

  mounted: function() {
    // Set nomor DO awal saat komponen dimuat
    this.form.nomorDO = this.generateDO();
  }
});
