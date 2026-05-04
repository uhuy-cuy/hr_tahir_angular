import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreService } from 'src/app/services/core.service';

// 🔥 Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-presensi',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    FormsModule,
  ],
  templateUrl: './presensi.component.html',
})
export class PresensiComponent implements OnInit {
  constructor(private core: CoreService) {}

  currentDate: Date = new Date();
  today: string = '';
  currentTime: string = '';
  todayKey: string = '';

  status: string = 'Belum Absen';
  sudahMasuk = false;
  sudahPulang = false;

  jamMasuk: string | null = null;
  jamKeluar: string | null = null;

  izin = false;

  // 🔥 table config
  displayedColumns: string[] = ['tanggal', 'masuk', 'pulang', 'status'];
  dataSource: any[] = [];

  isFutureMonth(month: number, year: number): boolean {
    const now = new Date();
    const selected = new Date(year, month);

    return selected > now;
  }

  formatTanggal(tanggal: string) {
    const d = new Date(tanggal);

    const tahun = d.getFullYear();
    const bulan = String(d.getMonth() + 1).padStart(2, '0');
    const hari = String(d.getDate()).padStart(2, '0');

    return `${tahun}-${bulan}-${hari}`;
  }
  capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  normalizeDate(date: any): string {
    const d = new Date(date);

    const pad = (n: number) => String(n).padStart(2, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  loadRiwayat() {
    if (this.core.checkTokenExpired()) {
      return;
    }
    const id_karyawan = localStorage.getItem('id_karyawan');

    this.core.getAbsensiAllByUser(id_karyawan).subscribe({
      next: (res: any) => {
        const riwayat = res?.riwayat || [];

        this.dataSource = this.dataSource.map((day) => {
          const match = riwayat.find(
            (item: any) => this.normalizeDate(item.tanggal) === day.tanggalKey,
          );

          return {
            tanggalKey: day.tanggalKey,
            tanggal: this.formatTanggalIndo(day.tanggalKey),
            jamMasuk: match?.jam_masuk ?? '-',
            jamKeluar: match?.jam_keluar ?? '-',
            status: this.capitalize(match?.status ?? 'Belum Absen'),
          };
        });
      },
      error: (err) => {
        console.error('Gagal ambil riwayat', err);
      },
    });
  }
  months = [
    { value: 0, label: 'Januari' },
    { value: 1, label: 'Februari' },
    { value: 2, label: 'Maret' },
    { value: 3, label: 'April' },
    { value: 4, label: 'Mei' },
    { value: 5, label: 'Juni' },
    { value: 6, label: 'Juli' },
    { value: 7, label: 'Agustus' },
    { value: 8, label: 'September' },
    { value: 9, label: 'Oktober' },
    { value: 10, label: 'November' },
    { value: 11, label: 'Desember' },
  ];

  years: number[] = [];

  selectedMonth!: number;
  selectedYear!: number;

  onChangeMonthYear() {
    this.currentDate = new Date(this.selectedYear, this.selectedMonth, 1);

    this.generateCalendar(this.currentDate);
    this.loadRiwayat();
  }

  formatTanggalIndo(tanggal: string): string {
    const d = new Date(tanggal);

    return d
      .toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
      .replace(/\b\w/g, (l) => l.toUpperCase()); // kapital huruf awal
  }

  ngOnInit(): void {
    if (this.core.checkTokenExpired()) {
      return;
    }
    const now = new Date();

    this.selectedMonth = now.getMonth();
    this.selectedYear = now.getFullYear();

    // tahun (misal 5 tahun ke belakang)
    for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
      this.years.push(y);
    }

    this.today = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // kapital huruf pertama
    this.today = this.today.replace(/\b\w/g, (l) => l.toUpperCase());

    setInterval(() => {
      const now = new Date();

      const jam = String(now.getHours()).padStart(2, '0');
      const menit = String(now.getMinutes()).padStart(2, '0');
      const detik = String(now.getSeconds()).padStart(2, '0');

      this.currentTime = `${jam}:${menit}:${detik}`;
    }, 1000);
    this.generateCalendar(this.currentDate);

    const id_karyawan = localStorage.getItem('id_karyawan');

    this.core.getAbsensiByUser(id_karyawan).subscribe((res) => {
      const hariIni = res?.hariIni;

      if (hariIni) {
        this.sudahMasuk = !!hariIni.jam_masuk;
        this.sudahPulang = !!hariIni.jam_keluar;

        this.jamMasuk = hariIni.jam_masuk;
        this.jamKeluar = hariIni.jam_keluar;
        this.status = hariIni.status;
        this.izin = hariIni.status?.toLowerCase() === 'izin';
      }
    });
    // untuk isi calender 1 bulan
    this.core.getAbsensiAllByUser(id_karyawan).subscribe({
      next: (res: any) => {
        const riwayat = res?.riwayat || [];

        this.dataSource = this.dataSource.map((day) => {
          const match = riwayat.find(
            (item: any) => this.normalizeDate(item.tanggal) === day.tanggalKey,
          );

          return {
            tanggal: this.formatTanggalIndo(day.tanggal),
            jamMasuk: match?.jam_masuk ?? '-',
            jamKeluar: match?.jam_keluar ?? '-',
            status: this.capitalize(match?.status ?? 'Belum Absen'),
          };
        });
      },
      error: (err) => {
        console.error('Gagal ambil riwayat', err);
      },
    });
  }

  generateCalendar(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    this.dataSource = [];

    for (let i = 1; i <= totalDays; i++) {
      const tgl = new Date(year, month, i);

      const tahun = tgl.getFullYear();
      const bulan = String(tgl.getMonth() + 1).padStart(2, '0');
      const hari = String(tgl.getDate()).padStart(2, '0');
      const key = `${tahun}-${bulan}-${hari}`;

      this.dataSource.push({
        tanggalKey: key, // 🔥 untuk logic
        tanggal: this.formatTanggalIndo(key), // 🔥 untuk UI // ✅ FIX
        masuk: '-',
        pulang: '-',
        status: 'Belum Absen',
      });
    }
  }

  updateCalendarToday(status: string) {
    const now = new Date();
    const todayKey = this.formatTanggal(now.toISOString());

    const index = this.dataSource.findIndex((d) => d.tanggalKey === todayKey);

    if (index !== -1) {
      this.dataSource[index] = {
        tanggalKey: todayKey,
        tanggal: this.formatTanggalIndo(todayKey),
        jamMasuk: status === 'hadir' ? (this.jamMasuk ?? '-') : '-',
        jamKeluar: status === 'hadir' ? (this.jamKeluar ?? '-') : '-',
        status: this.capitalize(status),
      };

      this.dataSource = [...this.dataSource];
    }
  }

  absenMasuk() {
    if (this.sudahMasuk) return;

    const now = new Date();

    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');

    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, '0');
    const hari = String(now.getDate()).padStart(2, '0');

    this.jamMasuk = `${jam}:${menit}:${detik}`;
    this.status = 'Hadir';
    this.sudahMasuk = true;

    const id_karyawan = localStorage.getItem('id_karyawan');

    const data = {
      id_karyawan: id_karyawan,
      tanggal: `${tahun}-${bulan}-${hari}`, // ✅ 2026-04-30
      jam_masuk: this.jamMasuk,
      status: 'hadir',
      created_at: `${tahun}-${bulan}-${hari} ${jam}:${menit}:${detik}`, // ✅ format DB
    };

    this.core.absenMasuk(data).subscribe({
      next: (res: any) => {
        console.log('Absen masuk berhasil', res);
        this.updateCalendarToday('hadir');
      },
      error: (err) => {
        console.error('Gagal absen masuk', err);
      },
    });
    this.generateCalendar(this.currentDate);
    this.loadRiwayat();
  }

  absenPulang() {
    if (!this.sudahMasuk || this.sudahPulang) return;

    const now = new Date();

    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');

    this.jamKeluar = `${jam}:${menit}:${detik}`;
    this.sudahPulang = true;

    const id_karyawan = localStorage.getItem('id_karyawan');

    // 🔥 ambil dulu data hari ini
    this.core.getAbsensiByUser(id_karyawan).subscribe({
      next: (res: any) => {
        const id_absensi = res?.hariIni?.id_absensi;

        if (!id_absensi) {
          console.error('ID absensi tidak ditemukan');
          return;
        }

        const data = {
          jam_keluar: this.jamKeluar,
          updated_at: now.toISOString(),
        };

        // 🔥 baru update
        this.core.updateAbsen(id_absensi, data).subscribe({
          next: (res: any) => {
            this.updateCalendarToday('hadir');
            console.log('Absen pulang berhasil', res);
          },
          error: (err) => {
            console.error('Gagal absen pulang', err);
          },
        });
      },
      error: (err) => {
        console.error('Gagal ambil data absensi', err);
      },
    });

    // 🔥 update tampilan tabel
    const todayIndex = this.dataSource.findIndex(
      (d) => d.tanggal === this.todayKey,
    );

    if (todayIndex !== -1) {
      this.dataSource[todayIndex] = {
        tanggal: this.todayKey,
        masuk: this.jamMasuk,
        pulang: this.jamKeluar,
        status: 'Hadir',
      };
    }
  }

  izinHariIni() {
    if (this.sudahMasuk || this.izin) return;

    const now = new Date();

    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');

    const tanggal = this.formatTanggal(now.toISOString());

    const id_karyawan = localStorage.getItem('id_karyawan');

    const data = {
      id_karyawan: id_karyawan,
      tanggal: tanggal,
      jam_masuk: null,
      status: 'izin',
      created_at: `${tanggal} ${jam}:${menit}:${detik}`,
    };

    this.core.absenMasuk(data).subscribe({
      next: (res: any) => {
        // 🔥 update state setelah sukses
        this.status = 'Izin';
        this.izin = true;

        // ⛔ jangan pakai sudahMasuk untuk izin
        // this.sudahMasuk = true;

        // 🔥 update kalender
        this.updateCalendarToday('izin');

        // 🔥 reload data biar sinkron
        this.generateCalendar(this.currentDate);
        this.loadRiwayat();

        console.log('Izin berhasil', res);
      },
      error: (err) => {
        console.error('Gagal izin', err);
      },
    });
  }
}
