import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-another-page',
  templateUrl: './another-page.component.html',
  styleUrls: ['./another-page.component.scss']
})
export class AnotherPageComponent implements OnInit {

  src: string = 'https://api.academypsb.ru/education/streaming/media/courses/videos/123/1632736690.843429.mp4'

  constructor() { }

  ngOnInit(): void {
  }

  changeSrc(path: string): void {
    this.src = path
    console.log(this.src);
  }
}
