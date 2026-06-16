// services/chatbot.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5135/api/chatbot/chat';

  // Khởi tạo tin nhắn chào mừng từ Llama 3.1
  private messagesSubject = new BehaviorSubject<Message[]>([
    { sender: 'bot', text: 'Xin chào! Mình là trợ lý ảo Llama 3.1. Mình có thể giúp gì cho bạn về việc đặt sân thể thao hôm nay?' }
  ]);
  
  messages$ = this.messagesSubject.asObservable();
  loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  sendMessage(userText: string) {
    if (!userText.trim() || this.loadingSubject.value) return;

    // 1. Thêm tin nhắn của User vào danh sách hiển thị ngay lập tức
    const currentMsgs = this.messagesSubject.value;
    const userMsg: Message = { sender: 'user', text: userText };
    this.messagesSubject.next([...currentMsgs, userMsg]);

    // Bật hiệu ứng loading chờ bot trả lời
    this.loadingSubject.next(true);

    // 2. Gửi request - Đã sửa đúng key "prompt" theo Swagger của bạn
    this.http.post<any>(this.apiUrl, { prompt: userText }).subscribe({
      next: (res) => {
        console.log('Dữ liệu AI thực tế trả về:', res);

        // Khớp chuẩn theo cấu trúc JSON từ .NET trả về trong Swagger của bạn
        const isSuccess = res && (res.success === true || res.Success === true);
        const replyText = res ? (res.reply || res.Reply) : null;

        let botReply = 'Có lỗi xảy ra khi xử lý câu hỏi hoặc định dạng JSON sai.';
        if (isSuccess && replyText) {
          botReply = replyText;
        }

        // Cập nhật tin nhắn của bot vào luồng dữ liệu
        this.messagesSubject.next([...this.messagesSubject.value, { sender: 'bot', text: botReply }]);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        console.error('Lỗi kết nối API .NET:', err);
        this.messagesSubject.next([...this.messagesSubject.value, { sender: 'bot', text: 'Không thể kết nối tới máy chủ AI.' }]);
        this.loadingSubject.next(false);
      }
    });
  }
}