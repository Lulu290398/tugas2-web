// stok-app.js — logika Vue untuk stok.html

new Vue({
  el: '#app',

  data: {
    // Filter & Sort
    filterUPBJJ: '',
    filterKategori: '',
    filterStatus: '',
    sortBy: 'judul',

    // State edit
    editIndex: null,
    editForm: null,

    // Pesan error
    errorMessage: '',

    // Form tambah data baru
    form: {
      kode: '',
      judul: '',
      kategori: '',
      upbjj: '',
      lokasiRak: '',
      harga: '',
      qty: '',
      safety: '',
      catatanHTML: ''
    },

    // Data dari shared dummy data
    upbjjList: upbjjList,
    kategoriList: kategoriList,
    stok: stokAwal.map(function(item) { return Object.assign({}, item); })
  },

  computed: {
    // Computed filteredStok - tidak perlu recompute manual, Vue reaktif otomatis
    filteredStok: function() {
      var result = this.stok.slice();

      // Filter UPBJJ
      if (this.filterUPBJJ) {
        result = result.filter(function(item) {
          return item.upbjj === this.filterUPBJJ;
        }.bind(this));
      }

      // Filter Kategori (dependent: hanya aktif jika filterUPBJJ dipilih)
      if (this.filterUPBJJ && this.filterKategori) {
        result = result.filter(function(item) {
          return item.kategori === this.filterKategori;
        }.bind(this));
      }

      // Filter Status
      if (this.filterStatus === 'warning') {
        result = result.filter(function(item) {
          return item.qty > 0 && item.qty < item.safety;
        });
      } else if (this.filterStatus === 'kosong') {
        result = result.filter(function(item) {
          return item.qty === 0 || item.qty === '0';
        });
      }

      // Sort
      var sortBy = this.sortBy;
      result.sort(function(a, b) {
        if (sortBy === 'judul') {
          return a.judul.localeCompare(b.judul);
        } else if (sortBy === 'qty') {
          return Number(a.qty) - Number(b.qty);
        } else if (sortBy === 'harga') {
          return Number(a.harga) - Number(b.harga);
        }
        return 0;
      });

      return result;
    }
  },

  methods: {
    // Menentukan status stok
    getStatus: function(item) {
      if (Number(item.qty) === 0) return 'kosong';
      if (Number(item.qty) < Number(item.safety)) return 'warning';
      return 'safe';
    },

    // Label teks status
    getLabelStatus: function(item) {
      var s = this.getStatus(item);
      if (s === 'kosong') return '🔴 Kosong';
      if (s === 'warning') return '⚠️ Menipis';
      return '✅ Aman';
    },

    // Tambah data baru
    tambahData: function() {
      if (
        !this.form.kode ||
        !this.form.judul ||
        !this.form.kategori ||
        !this.form.upbjj ||
        !this.form.lokasiRak ||
        !this.form.harga ||
        this.form.qty === '' ||
        !this.form.safety
      ) {
        this.errorMessage = 'Semua field wajib diisi!';
        return;
      }

      // Cek duplikasi kode
      var duplikat = this.stok.find(function(item) {
        return item.kode === this.form.kode;
      }.bind(this));

      if (duplikat) {
        this.errorMessage = 'Kode mata kuliah sudah ada!';
        return;
      }

      this.stok.push({
        kode: this.form.kode,
        judul: this.form.judul,
        kategori: this.form.kategori,
        upbjj: this.form.upbjj,
        lokasiRak: this.form.lokasiRak,
        harga: Number(this.form.harga),
        qty: Number(this.form.qty),
        safety: Number(this.form.safety),
        catatanHTML: this.form.catatanHTML
      });

      this.errorMessage = '';
      this.resetForm();
    },

    // Mulai edit baris
    mulaiEdit: function(index) {
      this.editIndex = index;
      this.editForm = Object.assign({}, this.stok[index]);
    },

    // Simpan hasil edit
    simpanEdit: function(index) {
      if (this.editForm.qty < 0 || this.editForm.safety < 0) {
        this.errorMessage = 'Qty dan Safety tidak boleh negatif!';
        return;
      }
      Object.assign(this.stok[index], this.editForm);
      this.editIndex = null;
      this.editForm = null;
      this.errorMessage = '';
    },

    // Batal edit
    batalEdit: function() {
      this.editIndex = null;
      this.editForm = null;
    },

    // Hapus data
    hapusData: function(index) {
      if (confirm('Hapus data ini?')) {
        this.stok.splice(index, 1);
      }
    },

    // Reset semua filter
    resetFilter: function() {
      this.filterUPBJJ = '';
      this.filterKategori = '';
      this.filterStatus = '';
      this.sortBy = 'judul';
    },

    // Reset form tambah
    resetForm: function() {
      this.form = {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: '',
        qty: '',
        safety: '',
        catatanHTML: ''
      };
    },

    // Format rupiah
    formatRupiah: function(angka) {
      return 'Rp ' + Number(angka).toLocaleString('id-ID');
    }
  },

  watch: {
    // Watcher 1: Reset filterKategori saat UPBJJ berubah (dependent options)
    filterUPBJJ: function() {
      this.filterKategori = '';
    },

    // Watcher 2: Validasi qty tidak negatif saat mengisi form
    'form.qty': function(value) {
      if (value !== '' && Number(value) < 0) {
        this.errorMessage = 'Qty tidak boleh negatif!';
      } else {
        this.errorMessage = '';
      }
    },

    // Watcher 3: Validasi qty edit tidak negatif
    'editForm.qty': function(value) {
      if (value !== null && value !== '' && Number(value) < 0) {
        this.errorMessage = 'Qty tidak boleh negatif!';
      } else {
        this.errorMessage = '';
      }
    }
  }
});
