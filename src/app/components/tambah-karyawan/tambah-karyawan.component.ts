import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import Swal from 'sweetalert2';
import { CoreService } from 'src/app/services/core.service';
import { OnInit } from '@angular/core';
import { map, startWith, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-tambah-karyawan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule
  ],
  templateUrl: './tambah-karyawan.component.html'
})
export class TambahKaryawanComponent implements OnInit {

  loading = false;

  form = new FormGroup({
    nama: new FormControl('', Validators.required),
    nik: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    status: new FormControl('aktif', Validators.required),

    id_jabatan: new FormControl<number | null>(null, Validators.required),
    id_departemen: new FormControl<number | null>(null, Validators.required),

    jabatan_display: new FormControl(''),
    departemen_display: new FormControl(''),
  });

  jabatanFilter$ = new BehaviorSubject<string>('');
  departemenFilter$ = new BehaviorSubject<string>('');

  listJabatan: any[] = [];
  listDepartemen: any[] = [];



  filteredJabatan!: any;

  filteredDepartemen!: any;


  constructor(
    private core: CoreService,
    private dialogRef: MatDialogRef<TambahKaryawanComponent>
  ) { }


  ngOnInit() {
    if (this.core.checkTokenExpired()) {
      this.dialogRef.close();
      return;
    }

    this.loadMaster();

    // ===== JABATAN =====
    this.filteredJabatan = this.jabatanFilter$.pipe(
      map((keyword: string) => {
        const k = keyword.toLowerCase();

        return this.listJabatan.filter(j =>
          j.nama_jabatan.toLowerCase().includes(k)
        );
      })
    );

    // ===== DEPARTEMEN =====
    this.filteredDepartemen = this.departemenFilter$.pipe(
      map((keyword: string) => {
        const k = keyword.toLowerCase();

        return this.listDepartemen.filter(d =>
          d.nama_departemen.toLowerCase().includes(k)
        );
      })
    );
  }

  openJabatan(trigger: MatAutocompleteTrigger) {
    setTimeout(() => {
      trigger.openPanel();
    });
  }
  openDepartemen(trigger: MatAutocompleteTrigger) {
    setTimeout(() => {
      trigger.openPanel();
    });
  }

  displayJabatan = (j: any): string => {
    return j?.nama_jabatan ?? '';
  }

  displayDepartemen = (d: any): string => {
    return d?.nama_departemen ?? '';
  }

  loadMaster() {
    this.core.getJabatan().subscribe(res => {
      this.listJabatan = res.data || res;
    });

    this.core.getDepartemen().subscribe(res => {
      this.listDepartemen = res.data || res;
    });
  }

  selectJabatan(j: any) {
    this.form.patchValue({
      id_jabatan: j.id_jabatan,
      jabatan_display: j
    });
  }

  selectDepartemen(d: any) {
    this.form.patchValue({
      id_departemen: d.id_departemen,
      departemen_display: d
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;

    const payload = {
      nama: this.form.value.nama,
      nik: this.form.value.nik,
      email: this.form.value.email,
      phone: this.form.value.phone,
      status: this.form.value.status,
      id_jabatan: this.form.value.id_jabatan,
      id_departemen: this.form.value.id_departemen
    };

    this.core.addKaryawan(payload).subscribe({
      next: () => {
        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Karyawan berhasil ditambahkan'
        });

        this.core.triggerEmployeeChange();
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal menambah karyawan'
        });

        console.error(err);
      }
    });
  }
}