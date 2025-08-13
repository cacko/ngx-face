import { Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { FileValidator, MaterialFileInputModule, FileInputComponent } from 'ngx-custom-material-file-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AbstractControl, AsyncValidator, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { LoaderService } from '../../service/loader.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GeneratedEntitty } from '../../entity/upload.entity';
import { MatIconModule } from '@angular/material/icon';
import { OptionsComponent } from '../options/options.component';
import { Observable, Subject, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { FaceService } from '../../service/face.service';




@Component({
  selector: 'app-style',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialFileInputModule, RouterModule, MatFormFieldModule, MatIconModule, OptionsComponent, MatButtonModule],
  templateUrl: './style.component.html',
  styleUrl: './style.component.scss'
})
export class StyleComponent {

  form: FormGroup;
  fileControl: FormControl;
  accept = '.jpg,.png,.webp';

  private fileSubject = new Subject<string | null>();
  $file = this.fileSubject.asObservable();


  @ViewChild('fileInput', { static: false }) fileInput: FileInputComponent | undefined;
  @ViewChild('fileImage', { static: false }) fileImage: ElementRef | undefined;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private loader: LoaderService,
    private faceService: FaceService
  ) {
    this.fileControl = new FormControl('', {
      validators: [
        Validators.required,
        FileValidator.maxContentSize(30 * 1024 * 1024)
      ],
    })
    this.form = this.fb.group({
      file: this.fileControl
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
        console.error(err);
        this.loader.hide();
      }
    })
  }

}
