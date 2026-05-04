import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { map, startWith } from 'rxjs';
import { CoreService } from 'src/app/services/core.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
// =========================
// TYPE
// =========================
interface Jabatan {
  id_jabatan: number;
  nama_jabatan: string;
}

interface Departemen {
  id_departemen: number;
  nama_departemen: string;
}

@Component({
  selector: 'app-edit-karyawan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDialogModule
  ],
  templateUrl: './edit-karyawan.component.html',
})
export class EditKaryawanComponent implements OnInit {

  // =========================
  // FORM
  // =========================
  form = new FormGroup({
    nama: new FormControl('', [Validators.required]),
    nik: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),

    id_jabatan: new FormControl<number | null>(null, [Validators.required]),
    id_departemen: new FormControl<number | null>(null, [Validators.required]),

    status: new FormControl('', [Validators.required]),

    jabatan_display: new FormControl('', [Validators.required]),
    departemen_display: new FormControl('', [Validators.required]),
  });

  // =========================
  // DATA LIST
  // =========================
  listJabatan: Jabatan[] = [];
  listDepartemen: Departemen[] = [];

  filteredJabatan: any;
  filteredDepartemen: any;

  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditKaryawanComponent>,
    private core: CoreService
  ) { }

  ngOnInit() {
    if (this.core.checkTokenExpired()) {
      this.dialogRef.close();
      return;
    }
    this.loadMasterData();
    this.initAutocomplete();
    setTimeout(() => {
      this.form.patchValue({
        nama: this.data?.nama,
        nik: this.data?.nik,
        email: this.data?.email,
        phone: this.data?.phone,
        status: this.data?.status,

        id_jabatan: this.data?.id_jabatan,
        id_departemen: this.data?.id_departemen,
      });
    });
  }

  // =========================
  // AUTOCOMPLETE
  // =========================
  initAutocomplete() {

    this.filteredJabatan = this.form.get('jabatan_display')!.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        const keyword = typeof value === 'string' ? value : value?.nama_jabatan;

        return this.listJabatan.filter(j =>
          j.nama_jabatan.toLowerCase().includes((keyword || '').toLowerCase())
        );
      })
    );

    this.filteredDepartemen = this.form.get('departemen_display')!.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        const keyword = typeof value === 'string' ? value : value?.nama_departemen;

        return this.listDepartemen.filter(d =>
          d.nama_departemen.toLowerCase().includes((keyword || '').toLowerCase())
        );
      })
    );
  }

  // =========================
  // LOAD DATA
  // =========================
  loadMasterData() {
    this.core.getJabatan().subscribe((res: any) => {
      this.listJabatan = res.data || res;
      this.setInitialJabatan();
    });

    this.core.getDepartemen().subscribe((res: any) => {
      this.listDepartemen = res.data || res;
      this.setInitialDepartemen();
    });
  }

  // =========================
  // INIT VALUE (EDIT MODE)
  // =========================
  setInitialJabatan() {
    const selected = this.listJabatan.find(j => j.id_jabatan == this.data?.id_jabatan);

    if (selected) {
      this.form.patchValue({
        id_jabatan: selected.id_jabatan,
        jabatan_display: selected.nama_jabatan
      });
    }
  }

  setInitialDepartemen() {
    const selected = this.listDepartemen.find(d => d.id_departemen == this.data?.id_departemen);

    if (selected) {
      this.form.patchValue({
        id_departemen: selected.id_departemen,
        departemen_display: selected.nama_departemen
      });
    }
  }

  // =========================
  // SELECT EVENT
  // =========================
  selectJabatan(j: Jabatan) {
    this.form.patchValue({
      id_jabatan: j.id_jabatan,
      jabatan_display: j.nama_jabatan
    });
  }

  selectDepartemen(d: Departemen) {
    this.form.patchValue({
      id_departemen: d.id_departemen,
      departemen_display: d.nama_departemen
    });
  }

  // =========================
  // SUBMIT
  // =========================
  submit() {
    if (this.form.invalid) return;

    this.loading = true;

    const payload = {
      nama: this.form.value.nama,
      nik: this.form.value.nik,
      email: this.form.value.email,
      phone: this.form.value.phone,
      id_jabatan: this.form.value.id_jabatan,
      id_departemen: this.form.value.id_departemen,
      status: this.form.value.status,
    };

    this.core.updateKaryawan(this.data.id_karyawan, payload).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
        this.core.triggerEmployeeChange();

      },
      error: (err) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Update karyawan gagal!',
        });

        console.error(err);
      }
    });
  }
}