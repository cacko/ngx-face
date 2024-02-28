import { Component, ElementRef, Input, OnInit } from '@angular/core';
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

  constructor(
    private elementRef: ElementRef
  ) {

  }

  ngOnInit(): void {
    this.setBackground(this.user.photoURL || "");
  }

  private setBackground(src: string) {
    this.elementRef.nativeElement.style.backgroundImage = `url('${src}')`;
  }



}
