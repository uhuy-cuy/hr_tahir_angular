import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormsModule } from '@angular/forms';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cuti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuti.component.html',
})
export class CutiComponent implements OnInit, AfterViewInit {
  cutiList: any[] = [];
  id_karyawan: any;
  totalCuti = 12;
  terpakai = 0;
  sisa = 12;
  startDate: string = '';
  endDate: string = '';
  jenis_cuti: string = '';
  alasan: string = '';
  tanggal_mulai: string = '';
  tanggal_selesai: string = '';

  constructor(private core: CoreService) {}

  formatTanggal(tanggal: string): string {
    const date = new Date(tanggal);

    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  ngOnInit(): void {
    if (this.core.checkTokenExpired()) {
      return;
    }
    this.id_karyawan = localStorage.getItem('id_karyawan');
    this.loadCuti();
  }

  hitungCuti() {
    const tahunSekarang = new Date().getFullYear();

    this.terpakai = this.cutiList
      .filter((c) => {
        const tanggal = new Date(c.tanggal_mulai);
        const tahunCuti = tanggal.getFullYear();

        return c.status === 'disetujui' && tahunCuti === tahunSekarang;
      })
      .reduce((sum, c) => {
        const mulai = new Date(c.tanggal_mulai);
        const selesai = new Date(c.tanggal_selesai);

        const selisihHari =
          (selesai.getTime() - mulai.getTime()) / (1000 * 60 * 60 * 24) + 1;

        return sum + (selisihHari > 0 ? selisihHari : 0);
      }, 0);

    this.sisa = this.totalCuti - this.terpakai;

    // console.log('TERPAKAI:', this.terpakai);
  }

  getDurasiCuti(start: string, end: string): number {
    const mulai = new Date(start);
    const selesai = new Date(end);

    const selisihHari =
      (selesai.getTime() - mulai.getTime()) / (1000 * 60 * 60 * 24) + 1;

    return selisihHari > 0 ? selisihHari : 0;
  }

  loadCuti() {
    this.core.getCutiByKaryawan(this.id_karyawan).subscribe({
      next: (res: any) => {
        this.cutiList = res.data || res || [];
        // console.log(this.cutiList);

        this.hitungCuti(); // 🔥 WAJIB
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  @ViewChild('dateRangeInput') dateRangeInput!: ElementRef;

  ngAfterViewInit(): void {
    setTimeout(() => {
      flatpickr(this.dateRangeInput.nativeElement, {
        mode: 'range',
        dateFormat: 'Y-m-d',

        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length === 2) {
            const start = instance.formatDate(selectedDates[0], 'Y-m-d');
            const end = instance.formatDate(selectedDates[1], 'Y-m-d');

            instance.input.value = `${start} s.d. ${end}`;

            this.tanggal_mulai = start;
            this.tanggal_selesai = end;
          }
        },
      });
    }, 0);
  }

  ajukanCuti() {
    if (this.core.checkTokenExpired()) {
      return;
    }
    const data = {
      id_karyawan: this.id_karyawan,
      tanggal_mulai: this.tanggal_mulai,
      tanggal_selesai: this.tanggal_selesai,
      jenis_cuti: this.jenis_cuti,
      alasan: this.alasan,
      created_at: new Date().toISOString().slice(0, 10),
      status: 'pending',
    };

    console.log('DATA CUTI:', data);

    this.core.addCuti(data).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Cuti berhasil diajukan',
          timer: 2000,
          showConfirmButton: false,
        });
        this.loadCuti();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  hapusCuti(id: number) {
    Swal.fire({
      title: 'Yakin hapus cuti?',
      text: 'Data tidak bisa dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        this.core.deleteCuti(String(id)).subscribe({
          next: (res: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Terhapus!',
              text: 'Cuti berhasil dihapus',
              timer: 1500,
              showConfirmButton: false,
            });

            this.loadCuti();
          },
          error: (err: any) => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Tidak bisa menghapus cuti',
            });
          },
        });
      }
    });
  }
}
