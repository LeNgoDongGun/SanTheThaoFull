using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
// THÊM CHÍNH XÁC DÒNG NÀY VÀO ĐẦU FILE
using AspNet.Security.OAuth.GitHub;
// THÊM THƯ VIỆN NÀY ĐỂ XỬ LÝ ĐỌC FILE VẬT LÝ TỪ WWWROOT
using Microsoft.Extensions.FileProviders;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// THÊM DÒNG NÀY VÀO ĐÂY ĐỂ ĐĂNG KÝ IHttpClientFactory
builder.Services.AddHttpClient();

// 1. Cấu hình Controller và JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler =
        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

// 2. Cấu hình Database Context
builder.Services.AddDbContext<SanTheThaoContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Cấu hình CORS cho Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200") // Cho phép Angular gọi sang
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed(origin => true) // THÊM MỚI: Cho phép nhận request động từ mọi nguồn (rất tốt khi MoMo Sandbox bắn IPN về endpoint backend của mày)
              .AllowCredentials()); 
});

// 4. CẤU HÌNH AUTHENTICATION CHO GOOGLE (THÊM MỚI TẠI ĐÂY)
builder.Services.AddAuthentication(options =>
{
    // Tự động đọc và giải mã Cookie ở trình duyệt để nhận diện User trên mọi API
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme; // CookieAuthenticationDefaults.AuthenticationScheme cũng chính là key mà middle lừu vô cookies
})
.AddCookie()
.AddGoogle(options =>
{
    // 1. Đọc thông tin Credentials từ file appsettings.json
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? "";
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? "";
    
    // 2. Endpoint mặc định xử lý callback từ phía Google Auth Server
    options.CallbackPath = "/signin-google";
})
.AddFacebook(options =>
{
    // 1. Đọc thông tin định danh và mật mã của Facebook
    options.AppId = builder.Configuration["Authentication:Facebook:AppId"] ?? "";
    options.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"] ?? "";
    
    // 2. Endpoint ngầm xử lý callback từ Facebook
    options.CallbackPath = "/signin-facebook";
})
.AddGitHub(options =>
{
    // 1. Đọc thông tin định danh và mật mã của GitHub
    options.ClientId = builder.Configuration["Authentication:GitHub:ClientId"] ?? "";
    options.ClientSecret = builder.Configuration["Authentication:GitHub:ClientSecret"] ?? "";
    
    // 2. Endpoint ngầm xử lý callback từ GitHub
    options.CallbackPath = "/signin-github";
    
    // 3. GitHub yêu cầu quyền middle phải xin được email cá nhân
    options.Scope.Add("user:email"); 
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Cấu hình HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

// CHUYỂN DÒNG NÀY LÊN ĐÂY
app.UseHttpsRedirection();

app.UseCors("AllowAngular");

// --- BẮT ĐẦU: FIX TRIỆT ĐỂ LỖI 404 ẢNH BẰNG PHYSICAL FILE PROVIDER ---
var wwwrootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(wwwrootPath))
{
    Directory.CreateDirectory(wwwrootPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(wwwrootPath),
    RequestPath = "" // Trỏ thẳng vào gốc để khớp với link /images/news/... bên Angular
});
// --- KẾT THÚC ---

// THÊM MỚI: Bắt buộc phải đặt UseAuthentication trước UseAuthorization
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();