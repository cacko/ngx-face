import { Component, ElementRef, Input, OnInit, inject } from '@angular/core';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent implements OnInit {

  @Input() user !: User;
  private elementRef = inject(ElementRef);

  constructor(
  ) {

  }

  ngOnInit(): void {
    this.setBackground(this.user.photoURL || "");
  }

  private setBackground(src: string) {
    this.elementRef.nativeElement.style.backgroundImage = `url('${src}')`;
  }



}
