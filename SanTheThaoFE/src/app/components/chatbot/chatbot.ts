import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core'; // Thêm ChangeDetectorRef ở đây
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, Message } from '../../services/chatbot';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  private chatbotService = inject(ChatbotService);
  private cdr = inject(ChangeDetectorRef); // Inject ChangeDetectorRef vào đây
  private sub = new Subscription();

  isOpen = false;
  loading = false;
  userPrompt = '';
  messages: Message[] = [];

  ngOnInit() {
    // Lắng nghe danh sách tin nhắn từ Service phát ra
    this.sub.add(
      this.chatbotService.messages$.subscribe(msgs => {
        this.messages = msgs;
        this.cdr.detectChanges(); // Ép Angular cập nhật lại UI khi có tin nhắn mới
      })
    );

    // Lắng nghe trạng thái loading từ Service
    this.sub.add(
      this.chatbotService.loading$.subscribe(isLoading => {
        this.loading = isLoading;
        this.cdr.detectChanges(); // Ép Angular cập nhật lại UI khi trạng thái loading thay đổi
      })
    );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userPrompt.trim() || this.loading) return;

    const currentPrompt = this.userPrompt.trim();
    this.chatbotService.sendMessage(currentPrompt);
    this.userPrompt = ''; 
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}