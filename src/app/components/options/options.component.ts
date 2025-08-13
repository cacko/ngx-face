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
import { DatabaseService } from '../../service/database.service';
import { NgPipesModule } from 'ngx-pipes';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, of, startWith } from 'rxjs';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatInputModule, MatButtonModule, StartCasePipe, NgPipesModule, MatExpansionModule, MatSlideToggleModule, MatCheckboxModule, MatAutocompleteModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss'
})
export class OptionsComponent implements OnInit {
  form: FormGroup;

  @Output() submit = new EventEmitter<PromptEntity>();
  @Input() prompt?: PromptEntity | null = null;

  $options = this.db.options;

  templates: string[] = [];
  models: string[] = [];
  filteredTemplates: Observable<string[]> = of([]);
  filteredModels: Observable<string[]> = of([]);


  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private db: DatabaseService
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
      height: [null],
    });
  }

  ngOnInit(): void {
    this.$options.subscribe((options) => {
      this.templates = options.templates;
      this.models = options.models;
      this.form.get("template")?.patchValue('');
      this.form.get("model")?.patchValue('');
    });
    if (this.prompt) {
      this.form.patchValue(this.prompt);
    }
    this.filteredTemplates = this.form.get("template")?.valueChanges.pipe(
      startWith(''),
      map(value => {
        value && this.form.patchValue({
          prompt: null,
          model: null,
          guidance_scale: null,
          scale: null,
          negative_prompt: null,
          clip_skip: null,
          seed: null,
          num_inference_steps: null,
          strength: null,
          width: null,
          height: null,
        });
        return this._filterTemplates(value || '');
      }),
    ) as Observable<string[]>;
    this.filteredModels = this.form.get("model")?.valueChanges.pipe(
      startWith(''),
      map(value => this._filterModels(value || '')),
    ) as Observable<string[]>;
  }

  private _filterTemplates(value: string): string[] {
    return this.templates;
    // const flt = value.toLowerCase();
    // return this.templates.filter(tpl => tpl.toLowerCase().includes(flt));
  }

  private _filterModels(value: string): string[] {
    return this.models;
    // const flt = value.toLowerCase();
    // return this.models.filter(mdl => mdl.toLowerCase().includes(flt));
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
