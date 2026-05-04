import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { EditKaryawanComponent } from 'src/app/components/edit-karyawan/edit-karyawan.component';
import { TambahKaryawanComponent } from 'src/app/components/tambah-karyawan/tambah-karyawan.component';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,

    // TambahKaryawanComponent
  ],
  templateUrl: './tables.component.html',
})
export class AppTablesComponent implements OnInit {
  //=================== search===================
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  // ==============PAGINATION ==============
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'id',
    'nama',
    'nik',
    'email',
    'phone',
    'jabatan',
    'departemen',
    'status',
    'action'
  ];
  dataSource = new MatTableDataSource<any>();

  constructor(
    private core: CoreService,
    private dialog: MatDialog,
    private router: Router

  ) { }

  ngOnInit(): void {
    this.loadKaryawans();
  }

  loadKaryawans() {
    this.core.getKaryawans().subscribe({
      next: (res) => {
        const data = res.data || res;

        const mapped = data.map((item: any, index: number) => ({
          id: index + 1,
          id_karyawan: item.id_karyawan || '-',
          nama: item.nama || '-',
          nik: item.nik || '-',
          email: item.email || '-',
          phone: item.phone || '-',
          id_jabatan: item.id_jabatan || item.jabatan?.id_jabatan || '-',
          nama_jabatan: item.nama_jabatan || item.jabatan?.nama_jabatan || '-',
          id_departemen: item.id_departemen || item.departemen?.id_departemen || '-',
          nama_departemen: item.nama_departemen || item.departemen?.nama_departemen || '-',
          status: item.status || '-',
        }));

        this.dataSource.data = mapped;

        // 🔥 attach paginator setelah data masuk
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const text = (
        data.nama +
        data.nik +
        data.email +
        data.phone +
        data.nama_jabatan +
        data.nama_departemen
      ).toLowerCase();

      return text.includes(filter);
    };
  }


  openEdit(row: any) {
    const dialogRef = this.dialog.open(EditKaryawanComponent, {
      width: '500px',
      data: row,
      backdropClass: 'custom-backdrop',
      panelClass: 'custom-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '150ms',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadKaryawans(); // 🔥 refresh table setelah edit
      }
    });
  }
  openAdd() {
    const dialogRef = this.dialog.open(TambahKaryawanComponent, {
      width: '500px',
      data: null,
      backdropClass: 'custom-backdrop',
      panelClass: 'custom-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '150ms',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadKaryawans();
      }
    });
  }
  goToView(row: any) {
    this.router.navigate(['/dashboard/view', row.id_karyawan]);
  }
  deleteData(id_karyawan: string) {

    if (!id_karyawan || id_karyawan === '-') {
      Swal.fire('Error', 'ID tidak valid', 'error');
      return;
    }

    Swal.fire({
      title: 'Yakin?',
      text: 'Data akan dihapus!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {

        Swal.fire({
          title: 'Menghapus...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.core.deleteData(id_karyawan).subscribe({
          next: () => {
            Swal.fire({
              title: 'Berhasil!',
              text: 'Data berhasil dihapus',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });

            // 🔥 tanpa reload
            this.dataSource.data = this.dataSource.data.filter(
              (item: any) => item.id_karyawan !== id_karyawan
            );
            this.core.triggerEmployeeChange();
          },
          error: (err) => {
            console.error(err);

            Swal.fire({
              title: 'Error!',
              text: 'Gagal hapus data',
              icon: 'error'
            });
          }
        });

      }
    });
  }
}