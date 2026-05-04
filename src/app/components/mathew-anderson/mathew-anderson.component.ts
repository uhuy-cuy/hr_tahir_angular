import { Component, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-mathew-anderson',
  imports: [MaterialModule, MatBadgeModule],
  templateUrl: './mathew-anderson.component.html',
})
export class AppMathewAndersonComponent implements OnInit {

  nama: string = '';

  ngOnInit() {
    this.nama = localStorage.getItem('name') || 'User';
  }

}