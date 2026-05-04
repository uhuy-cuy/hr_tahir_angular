import { Component, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { AppMathewAndersonComponent } from 'src/app/components/mathew-anderson/mathew-anderson.component';
import { AppTopCardsComponent } from 'src/app/components/top-cards/top-cards.component';
import { AppRevenueUpdatesComponent } from 'src/app/components/revenue-updates/revenue-updates.component';
import { AppYearlyBreakupComponent } from 'src/app/components/yearly-breakup/yearly-breakup.component';
import { AppMonthlyEarningsComponent } from 'src/app/components/monthly-earnings/monthly-earnings.component';
import { AppRecentTransactionsComponent } from 'src/app/components/recent-transactions/recent-transactions.component';
import { AppTopProjectsComponent } from 'src/app/components/top-projects/top-projects.component';
import { AppTablesComponent } from 'src/app/components/tables/tables.component';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-starter',
  imports: [
    MaterialModule,
    AppMathewAndersonComponent,
    AppTopCardsComponent,
    AppTablesComponent,
    // AppRevenueUpdatesComponent,
    // AppYearlyBreakupComponent,
    // AppMonthlyEarningsComponent,
    // AppRecentTransactionsComponent,
    // AppTopProjectsComponent
  ],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkAuth(); // 👈 WAJIB DIPANGGIL
  }

  checkAuth() {
    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Session Habis',
        text: 'Silakan login terlebih dahulu',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/authentication/login']);
      });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;

      if (Date.now() > exp) {
        localStorage.clear();

        Swal.fire({
          icon: 'info',
          title: 'Session Expired',
          text: 'Session kamu sudah habis, silakan login kembali',
          confirmButtonText: 'Login'
        }).then(() => {
          this.router.navigate(['/authentication/login']);
        });
      }
    } catch (e) {
      localStorage.clear();

      Swal.fire({
        icon: 'error',
        title: 'Token Error',
        text: 'Token tidak valid, silakan login ulang',
        confirmButtonText: 'Login'
      }).then(() => {
        this.router.navigate(['/authentication/login']);
      });
    }
  }
}
