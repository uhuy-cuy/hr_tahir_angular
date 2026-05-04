import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { CoreService } from 'src/app/services/core.service';
import { OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AfterViewInit } from '@angular/core';


export interface productsData {
  id: number;
  unama: string;
  email: string;
  priority: string;
}
@Component({
  selector: 'app-top-projects',
  standalone: true, // 🔥 WAJIB kalau kamu pakai imports: []
  imports: [MaterialModule, CommonModule, MatPaginatorModule],
  templateUrl: './top-projects.component.html',


})

export class AppTopProjectsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'nama', 'priority', 'email'];
  dataSource = new MatTableDataSource<any>();

  constructor(private core: CoreService) { }


  ngOnInit(): void {
    this.loadKaryawans();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadKaryawans() {
    this.core.getKaryawans().subscribe((res: any) => {

      const data = res.data || res;

      const mapped = data.map((item: any, index: number) => ({
        id: index + 1,
        nama: item.nama,
        email: item.email,
        nik: item.nik,
        priority: 'low'
      }));

      this.dataSource = new MatTableDataSource(mapped);

      // 🔥 re-attach paginator setelah data update
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

}