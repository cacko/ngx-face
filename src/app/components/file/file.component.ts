import { Component, ViewChild } from '@angular/core';
import { FileValidator, MaterialFileInputModule, FileInputComponent } from 'ngx-custom-material-file-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { LoaderService } from '../../service/loader.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { MatIconModule } from '@angular/material/icon';
import { OptionsComponent } from '../options/options.component';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-file',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialFileInputModule, RouterModule, MatFormFieldModule, MatIconModule, OptionsComponent, MatButtonModule],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss'
})
export class FileComponent {

  form: FormGroup;
  accept = '.jpg,.png,.webp';

  private fileSubject = new Subject<string | null>();
  $file = this.fileSubject.asObservable();


  @ViewChild('fileInput', { static: false }) fileInput: FileInputComponent | undefined;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private loader: LoaderService
  ) {
    this.form = this.fb.group({
      file: [null,
        [Validators.required, FileValidator.maxContentSize(30 * 1024 * 1024)]
      ]
    });
    this.form.get("file")?.valueChanges.subscribe((val) => {
      if (val) {
        const file = val.files[0];
        return this.fileSubject.next(URL.createObjectURL(file));
      }
      return this.fileSubject.next(null);
    });

  }
  onSubmit(data: any) {
    if (!this.form.valid) {
      return;
    }
    const fileInput = this.form.get("file");
    const file = fileInput?.value.files[0];
    this.loader.show();
    this.api.uploadForm(file, data).subscribe({
      next: (event: any) => {
        const response = event as GeneratedEntitty;
        this.loader.hide();
        this.router.navigateByUrl(`/g/${response.slug}`);
      },
      error: (err: any) => {
        console.log(err);
        this.loader.hide();
      }
    })
  }

}
