import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreService } from 'src/app/services/core.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-login',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-login.component.html',
  
})
export class AppSideLoginComponent {

  constructor(
    private router: Router,
    private core: CoreService
  ) { }

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }
  loading: boolean = false;
  submit() {
    this.loading = true; // 🔥 mulai loading

    const data = {
      name: this.form.value.uname || '',
      password: this.form.value.password || '',
    };

    // console.log('tes : ', data);

    this.core.login(data).subscribe({
      next: (res) => {
        this.loading = false; // 🔥 stop loading

        // console.log('Login sukses:', res);

        const token = res?.token;
        const name = res?.name || res?.user?.name;
        const role = res?.role || res?.user?.role;
        const id_karyawan = res?.id_karyawan || res?.user?.id_karyawan;

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('name', name || '');
          localStorage.setItem('role', role || '');
          localStorage.setItem('id_karyawan', id_karyawan || '');

          Swal.fire({
            icon: 'success',
            title: 'Login Berhasil',
            text: `Selamat datang ${name}`,
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/dashboard']);
          });

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Token tidak ditemukan!',
          });
        }
      },

      error: (err) => {
        this.loading = false; // 🔥 stop loading kalau error

        console.error('Login gagal:', err);

        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: 'Cek name / password kamu!',
        });
      },
    });
  }
}