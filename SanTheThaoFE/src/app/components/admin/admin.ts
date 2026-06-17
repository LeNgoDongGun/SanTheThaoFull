import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../services/auth';
import { CourtService } from '../../services/court';
import { BookingService } from '../../services/booking';
import { SporttypeService } from '../../services/sporttype';
import { NewsService } from '../../services/news';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html'
})
export class AdminComponent implements OnInit {
  private apiUrl = 'http://localhost:5135/api'; 

  activeTab = 'dashboard';
  tabs = [
    { key: 'dashboard', label: '📊 Thống kê' },
    { key: 'courts', label: '🏟️ Sân' },
    { key: 'bookings', label: '📋 Đơn đặt' },
    { key: 'users', label: '👥 Người dùng' },
    { key: 'news', label: '📰 Tin tức' }
  ];

  courts: any[] = [];
  bookings: any[] = [];
  users: any[] = [];
  news: any[] = [];
  sportTypes: any[] = [];

  // STATE SÂN
  newCourt: any = { sportTypeId: '', name: '', pricePerHour: 0, description: '' };
  selectedCourtImage: File | null = null;

  // STATE TIN TỨC
  newNews: any = { title: '', category: 'Bóng đá', summary: '', content: '' };
  selectedNewsImage: File | null = null;

  // BỘ LỌC ĐƠN ĐẶT
  bookingStatusFilter: number | null = null;

  // TÍNH NĂNG MỚI: STATE NGƯỜI DÙNG
  isEditingUser = false;
  userForm: any = { fullName: '', email: '', phoneNumber: '', password: '', role: 'Customer', isActive: true };

  // THỐNG KÊ (GETTERS)
  get pendingBookings() { return this.bookings.filter(b => b.status === 0).length; }
  get totalRevenue() { return this.bookings.filter(b => b.status === 1).reduce((s, b) => s + b.totalPrice, 0); }
  get filteredBookings() {
    if (this.bookingStatusFilter === null) return this.bookings;
    return this.bookings.filter(b => b.status === this.bookingStatusFilter);
  }

  constructor(
    public auth: AuthService,
    private courtService: CourtService,
    private bookingService: BookingService,
    private sportTypeService: SporttypeService,
    private newsService: NewsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (!this.auth.isAdmin()) return;
    this.loadData();
  }

  loadData() {
    this.courtService.getAll().subscribe((res: any) => this.courts = Array.isArray(res) ? res : (res.data || []));
    this.bookingService.getAll().subscribe((res: any) => this.bookings = Array.isArray(res) ? res : (res.data || []));
    this.sportTypeService.getAll().subscribe((res: any) => this.sportTypes = Array.isArray(res) ? res : (res.data || []));
    this.newsService.getAll().subscribe((res: any) => this.news = Array.isArray(res) ? res : (res.data || []));
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`).subscribe(res => this.users = Array.isArray(res) ? res : (res as any).data || []);
  }

  // ==========================================
  // LOGIC SÂN
  // ==========================================
  onCourtImageSelected(event: any) { this.selectedCourtImage = event.target.files[0]; }

  addCourt() {
    const formData = new FormData();
    formData.append('name', this.newCourt.name);
    formData.append('sportTypeId', this.newCourt.sportTypeId);
    formData.append('pricePerHour', this.newCourt.pricePerHour.toString());
    formData.append('description', this.newCourt.description);
    if (this.selectedCourtImage) formData.append('imageFile', this.selectedCourtImage);

    this.http.post(`${this.apiUrl}/courts`, formData).subscribe({
      next: () => {
        alert('Thêm sân thành công!');
        this.newCourt = { sportTypeId: '', name: '', pricePerHour: 0, description: '' };
        this.selectedCourtImage = null;
        this.loadData();
      },
      error: (err) => alert('Lỗi: ' + (err.error?.title || err.message))
    });
  }

  toggleCourt(court: any) {
    court.isActive = !court.isActive;
    this.courtService.update(court.id, court).subscribe();
  }

  // ==========================================
  // LOGIC ĐƠN ĐẶT
  // ==========================================
  setBookingFilter(status: number | null) { this.bookingStatusFilter = status; }
  confirmBooking(b: any) { b.status = 1; this.bookingService.update(b.id, b).subscribe(() => this.cdr.detectChanges()); }
  cancelBooking(b: any) {
    if (!confirm('Hủy đơn này?')) return;
    b.status = 2;
    this.bookingService.update(b.id, b).subscribe(() => this.cdr.detectChanges());
  }

  // ==========================================
  // TÍNH NĂNG MỚI: LOGIC NGƯỜI DÙNG
  // ==========================================
  saveUser() {
    if (this.isEditingUser) {
      // Gọi API Update (Put)
      this.http.put(`${this.apiUrl}/users/${this.userForm.id}`, this.userForm).subscribe({
        next: () => {
          alert('Cập nhật tài khoản thành công!');
          this.cancelEditUser();
          this.loadUsers();
        },
        error: (err) => alert('Lỗi cập nhật: ' + (err.error?.title || err.message))
      });
    } else {
      // Gọi API Đăng ký để thêm người mới
      this.auth.register(this.userForm).subscribe({
        next: () => {
          alert('Thêm người dùng thành công!');
          this.cancelEditUser();
          this.loadUsers();
        },
        error: (err) => alert('Lỗi thêm user: ' + (err.error?.title || err.message))
      });
    }
  }

  editUser(user: any) {
    this.isEditingUser = true;
    this.userForm = { ...user }; // Copy dữ liệu lên form
  }

  cancelEditUser() {
    this.isEditingUser = false;
    this.userForm = { fullName: '', email: '', phoneNumber: '', password: '', role: 'Customer', isActive: true };
  }

  toggleUser(user: any) {
    user.isActive = !user.isActive;
    this.http.put(`${this.apiUrl}/users/${user.id}`, user).subscribe();
  }

  deleteUser(user: any) {
    if (!confirm(`Xóa tài khoản ${user.fullName}?`)) return;
    this.http.delete(`${this.apiUrl}/users/${user.id}`).subscribe(() => this.loadUsers());
  }

  // ==========================================
  // ĐÃ FIX: LOGIC TIN TỨC 
  // ==========================================
  onNewsImageSelected(event: any) { this.selectedNewsImage = event.target.files[0]; }

  addNews() {
    // 1. Validate bắt buộc
    if (!this.newNews.title || !this.newNews.content || !this.newNews.summary) {
      alert('Vui lòng nhập đầy đủ Tiêu đề, Tóm tắt và Nội dung!');
      return;
    }

    // 2. Tự động tạo Slug chuẩn từ Tiêu đề
    const slug = this.newNews.title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    // 3. Đóng gói dữ liệu dạng FormData (multipart/form-data)
    const formData = new FormData();
    formData.append('title', this.newNews.title);
    formData.append('category', this.newNews.category);
    formData.append('summary', this.newNews.summary);
    formData.append('content', this.newNews.content);
    formData.append('slug', slug);
    
    // Gửi ID tác giả (ép sang string)
    const authorId = this.auth.getUser()?.id || 1; 
    formData.append('authorId', authorId.toString());

    // Đính kèm File ảnh (Quan trọng: Tên 'thumbnailFile' phải khớp với DTO bên C#)
    if (this.selectedNewsImage) {
      formData.append('thumbnailFile', this.selectedNewsImage);
    }

    // 4. Gửi lên API
    this.http.post(`${this.apiUrl}/newsposts`, formData).subscribe({
      next: () => {
        alert('Đăng bài thành công!');
        // Reset form
        this.newNews = { title: '', category: 'Bóng đá', summary: '', content: '' };
        this.selectedNewsImage = null;
        
        // Reset luôn thẻ <input type="file"> trên giao diện (nếu cần)
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        this.loadData();
      },
      error: (err) => {
        console.error("Lỗi đăng bài:", err);
        alert('Lỗi đăng bài: ' + (err.error?.title || err.message || 'Lỗi hệ thống'));
      }
    });
  }

  toggleNews(post: any) {
    post.isPublished = !post.isPublished;
    this.http.put(`${this.apiUrl}/newsposts/${post.id}`, post).subscribe();
  }

  deleteNews(post: any) {
    if (!confirm(`Xóa bài viết: ${post.title}?`)) return;
    this.http.delete(`${this.apiUrl}/newsposts/${post.id}`).subscribe(() => this.loadData());
  }

  // ==========================================
  // UI HELPERS
  // ==========================================
  statusLabel(s: number) { return ['⏳ Chờ xác nhận', '✅ Đã xác nhận', '❌ Đã hủy'][s] || '?'; }
  statusColor(s: number) {
    return [
      { bg: '#fef3c7', text: '#d97706' },
      { bg: '#dcfce7', text: '#16a34a' },
      { bg: '#fee2e2', text: '#dc2626' }
    ][s] || { bg: '#f1f5f9', text: '#64748b' };
  }
}