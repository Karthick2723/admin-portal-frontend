import { AfterViewInit, Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
interface Time {
  hour: number;
  minute: number;
}

@Component({
  selector: 'app-customize-timepicker',
  templateUrl: './customize-timepicker.component.html',
  styleUrls: ['./customize-timepicker.component.scss']
})
export class CustomizeTimepickerComponent implements OnInit, AfterViewInit {
  @Input() set timeString(value: string) {
    if (value) {
      this.time = this.convertTimeString(value);
    } else {
      this.time = { hour: 0, minute: 0 }; // Default time if empty string
    }
  }

  @Input() isInputFieldInvalid: boolean;
  @Input() isViewMode: boolean;
  time: any = { hour: 0, minute: 0 };
  @Output() timeChanged = new EventEmitter<{ hour: number, minute: number, second: number }>();
  meridian = true; 
  timeFormat = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  dropdownVisible: boolean = false;
  constructor() { }
  ngAfterViewInit(): void { }
  ngOnInit(): void { }
  showTimePicker() {
    this.dropdownVisible = true;
  }

  hideTimePicker() {
    setTimeout(() => this.dropdownVisible = false, 100);
  }
  convertTimeString(timeString: string): Time {
    if (!this.timeFormat.test(timeString)) {
      return { hour: 0, minute: 0 };
    } 
    const [hourPart, minutePart] = timeString.split(':');
    const hour = parseInt(hourPart, 10);
    const minute = parseInt(minutePart, 10);
    return { hour, minute };
  }

  get formattedTime(): string {
    if (this.time.hour === 0 && this.time.minute === 0) {
      return '12:00 AM'; 
    }
    const hour = this.time.hour > 12 ? this.time.hour - 12 : this.time.hour;
    const formattedHour = (hour === 0 ? 12 : hour).toString().padStart(2, '0');
    const minute = this.time.minute.toString().padStart(2, '0');
    const suffix = this.time.hour >= 12 ? 'PM' : 'AM';
    return `${formattedHour}:${minute} ${suffix}`;
  }

  onTimeInputChange(event: any): void {
    const value = event.target.value;
    const [hourPart, minutePart] = value.split(':');
    if (hourPart && minutePart && minutePart.length === 2) {
      const hour = parseInt(hourPart, 10);
      const minute = parseInt(minutePart, 10);
      if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
        this.time = { hour, minute };
        this.timeChanged.emit({ hour, minute, second: 0 });
      } else {
        this.resetTime();
      }
    } else {
      this.resetTime(); 
    }
  }
  
  resetTime() {
    this.time = { hour: 0, minute: 0 }; 
    this.timeChanged.emit({ hour: 0, minute: 0, second: 0 });
  }

  onTimepickerChange(newTime: { hour: number, minute: number }): void {
    this.time = newTime;
    this.timeChanged.emit({ hour: this.time?.hour, minute: this.time?.minute , second: 0 });
  }
}
