import { Component, ViewEncapsulation } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoaderComponent {
  isLoading$ = this.loaderService.isLoading$;
  constructor(private loaderService: LoaderService) {}
}
