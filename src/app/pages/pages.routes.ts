import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Starter' },
      ],
    },
  },
  // 🔥 KARYAWAN
  {
    path: '',
    children: [
      {
        path: 'view/:id',
        loadComponent: () =>
          import('../components/view-karyawan/view-karyawan.component')
            .then(m => m.ViewKaryawanComponent)
      },
       {
        path: 'presensi',
        loadComponent: () =>
          import('../components/presensi/presensi.component')
            .then(m => m.PresensiComponent)
      }
    ]
  }
];
