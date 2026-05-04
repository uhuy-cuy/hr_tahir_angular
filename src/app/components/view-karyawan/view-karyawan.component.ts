import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from 'src/app/services/core.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-view-karyawan',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './view-karyawan.component.html',
})
export class ViewKaryawanComponent implements OnInit {

  data: any;

  constructor(
    private route: ActivatedRoute,
    private core: CoreService,
    private location: Location
  ) { }

  ngOnInit(): void {
    if (this.core.checkTokenExpired()) {
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.core.getKaryawanById(id).subscribe((res: any) => {
        this.data = res.data || res;
      });
    }
  }
  goBack() {
    this.location.back();
  }
}