import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../service/api.service';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { OptionsEntity } from '../../entity/upload.entity';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatInputModule, MatButtonModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss'
})
export class OptionsComponent implements OnInit {
  form: FormGroup;

  @Output() submit = new EventEmitter<OptionsEntity>();

  $options = this.api.options;

  constructor(
    private fb: FormBuilder,
    private api: ApiService
  ) {
    this.form = this.fb.group({
      prompt: [null],
      model: [null],
      template: [null]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.submit.emit(this.form.value)
  }
}
