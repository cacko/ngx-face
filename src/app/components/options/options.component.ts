import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../service/api.service';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { StartCasePipe } from '../../pipes/start-case.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { PromptEntity } from '../../entity/view.entity';
@Component({
  selector: 'app-options',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatInputModule, MatButtonModule, StartCasePipe, MatExpansionModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss'
})
export class OptionsComponent implements OnInit {
  form: FormGroup;

  @Output() submit = new EventEmitter<PromptEntity>();
  @Input() prompt?: PromptEntity | null = null;

  $options = this.api.options;

  constructor(
    private fb: FormBuilder,
    private api: ApiService
  ) {
    this.form = this.fb.group({
      prompt: [null],
      model: [null],
      template: [null],
      guidance_scale: [null],
      num_inference_steps: [null],
      scale: [null],
      negative_prompt: [null],
      clip_skip: [null],
      seed: [null],
      strength: [null],
      width: [null],
      height: [null]
    });
  }

  ngOnInit(): void {
    if (this.prompt) {
      this.form.patchValue(this.prompt);
    }
    this.form.get("template")?.valueChanges.subscribe((value: any) => {
      value && this.form.patchValue({
        prompt: null,
        model: null,
        guidance_scale: null,
        scale: null,
        negative_prompt: null,
        clip_skip: null,
        seed: null,
        strength: null,
        num_inference_steps: null
      });
    })
  }

  onClear(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.form.reset();
  }

  onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.form.valid && this.submit.emit(this.form.value)
  }
}
