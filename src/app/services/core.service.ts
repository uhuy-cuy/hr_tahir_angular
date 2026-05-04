import { Injectable, signal } from '@angular/core';
import { AppSettings, defaults } from '../config';
import { BehaviorSubject, Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CoreService {

  // ================== API =========================

  private optionsSignal = signal<AppSettings>(defaults);
  private notify$ = new BehaviorSubject<Record<string, any>>({});

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient, private router: Router) {
    this.notify$.next(this.optionsSignal());
  }

  // ==========cek token=====================
  checkTokenExpired(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      this.forceLogout('Session Habis', 'Silakan login terlebih dahulu');
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;

      if (Date.now() > exp) {
        this.forceLogout('Session Expired', 'Silakan login kembali');
        return true;
      }

      return false;

    } catch (e) {
      this.forceLogout('Token Error', 'Token tidak valid');
      return true;
    }
  }

  private forceLogout(title: string, text: string) {
    localStorage.clear();

    Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Login',

      // 🔥 penting: custom z-index
      customClass: {
        container: 'swal-top'
      },

      didOpen: () => {
        const swalContainer = Swal.getContainer();
        if (swalContainer) {
          swalContainer.style.zIndex = '9999999';
        }
      }
    }).then(() => {
      this.router.navigate(['/authentication/login']);
    });
  }


  // ================= Realtime KETIKA EDIT PADA JUMLAH Employees =================

  private employeeChangeSubject = new BehaviorSubject<number>(0);

  employeeChanged$ = this.employeeChangeSubject.asObservable();

  triggerEmployeeChange() {
    this.employeeChangeSubject.next(Date.now());
  }

  // ================= LOGIN API =================
  login(data: { name: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }
  // ================= KARYAWAN COUNT =================
  getKaryawanCount(): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/karyawans/count`, { headers });
  }
  // ================= GET KARYAWAN =================
  getKaryawans(): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/karyawans`, { headers });
  }
  // ================= Update KARYAWAN =================
  updateKaryawan(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.put(
      `${this.apiUrl}/karyawans/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
  // ================= GET Jabatan =================
  getJabatan(): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/jabatans`, { headers });
  }
  // ================= GET Departemen =================
  getDepartemen(): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/departemens`, { headers });
  }
  // ================= Store Karyawan =================
  addKaryawan(data: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.post(
      `${this.apiUrl}/karyawans`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
  // ================= GET KARYAWAN =================
  getKaryawanById(id: string) {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get<any>(`${this.apiUrl}/karyawans/${id}`, { headers });
  }

  // ================= Delete KARYAWAN =================
  deleteData(id: string) {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.delete<any>(`${this.apiUrl}/karyawans/${id}`, { headers });
  }

  //  ================ABSEN MASUK===================
  absenMasuk(data: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.post(
      `${this.apiUrl}/absensis`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
  //  ================DATA ABSEN HARI INI===================
  getAbsensiByUser(id: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.get(
      `${this.apiUrl}/absensis/user/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
  //  ================ABSEN KELAUR===================
    updateAbsen(id: any, data: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.put(
      `${this.apiUrl}/absensis/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
   //  ================DATA ABSEN 1 bulan===================
  getAbsensiAllByUser(id: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.get(
      `${this.apiUrl}/absensis/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }







  // Observable for notification updates
  get notify(): Observable<Record<string, any>> {
    return this.notify$.asObservable();
  }

  getOptions(): AppSettings {
    return this.optionsSignal();
  }

  setOptions(options: Partial<AppSettings>) {
    this.optionsSignal.update((current) => ({
      ...current,
      ...options,
    }));

    // ❌ sebelumnya salah
    // this.notify$.next(this.optionsSignal);

    // ✅ harus dipanggil
    this.notify$.next(this.optionsSignal());
  }

  setLanguage(lang: string) {
    this.setOptions({ language: lang });
  }

  getLanguage() {
    return this.getOptions().language;
  }
}