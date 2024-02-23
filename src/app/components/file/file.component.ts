import { Component } from '@angular/core';
import { FileValidator, MaterialFileInputModule } from 'ngx-custom-material-file-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { HttpEventType } from '@angular/common/http';
import { LoaderService } from '../../service/loader.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-file',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialFileInputModule, RouterModule, MatFormFieldModule, MatIconModule],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss'
})
export class FileComponent {

  form: FormGroup;
  accept = '.jpg,.png,.webp';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private loader: LoaderService
  )
  {
    this.form = this.fb.group({
      file: [null,
        [Validators.required, FileValidator.maxContentSize(1000000)]
      ]
    });
    const fileInput = this.form.get("file");
    fileInput?.valueChanges.subscribe((value: any) => {
      console.log(value.files);
      const file = value.files[0];
      this.api.uploadForm(file, {}).subscribe({
        next: (event: any) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              break;
            case HttpEventType.Response:
              const response = event.body as GeneratedEntitty;
              this.loader.hide();
              this.router.navigateByUrl(`/g/${response.slug}`);
              break;
          }
        },
        error: (err: any) => {
          console.log(err);
          this.loader.hide();
        }
      })
    }
    )
  }

}
