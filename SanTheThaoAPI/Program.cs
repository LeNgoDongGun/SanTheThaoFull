using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

var builder = WebApplication.CreateBuilder(args);

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
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()); // THÊM MỚI: Cho phép truyền cookie/credentials qua lại nếu cần
});

// 4. CẤU HÌNH AUTHENTICATION CHO GOOGLE (THÊM MỚI TẠI ĐÂY)
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(options =>
{
    // Đọc thông tin Credentials từ file appsettings.json
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? "YOUR_GOOGLE_CLIENT_ID";
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? "YOUR_GOOGLE_CLIENT_SECRET";
    
    // Endpoint mặc định xử lý callback từ phía Google Auth Server
    options.CallbackPath = "/signin-google";
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Cấu hình HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAngular");

// THÊM MỚI: Bắt buộc phải đặt UseAuthentication trước UseAuthorization
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();
app.UseHttpsRedirection();

app.Run();