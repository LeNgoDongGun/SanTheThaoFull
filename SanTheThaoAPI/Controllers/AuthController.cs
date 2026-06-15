using System.Security.Claims;
using BCrypt.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.DTOs;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    public AuthController(SanTheThaoContext context) => _context = context;

    // 1. API ĐĂNG NHẬP TRUYỀN THỐNG
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);

        // Khắc phục cảnh báo cho user.PasswordHash (dùng toán tử ?)
        if (user == null || string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(ApiResponse<string>.Fail("Email hoặc mật khẩu không đúng"));

        return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Id = user.Id,
            FullName = user.FullName ?? "", // Xử lý null
            Email = user.Email ?? "",       // Xử lý null
            Role = user.Role ?? "Customer"  // Xử lý null
        }, "Đăng nhập thành công"));
    }

    // 2. API ĐĂNG KÝ TRUYỀN THỐNG
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(ApiResponse<string>.Fail("Email đã tồn tại"));

        var user = new User
        {
            FullName = dto.FullName ?? "",
            Email = dto.Email ?? "",
            PhoneNumber = dto.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password ?? Guid.NewGuid().ToString()), // Phòng hờ dto.Password null
            Role = "Customer",
            IsActive = true,
            CreatedAt = DateTime.Now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role
        }, "Đăng ký thành công"));
    }

    // 3. API DÙNG CHUNG ĐỂ CHALLENGE CHO CẢ GOOGLE, FACEBOOK, GITHUB
    [HttpGet("{provider}")]
    public IActionResult ChallengeSocial(string provider)
    {
        // provider? để tránh lỗi nếu string truyền vào null
        string? scheme = provider?.ToLower() switch
        {
            "google" => Microsoft.AspNetCore.Authentication.Google.GoogleDefaults.AuthenticationScheme,
            "facebook" => Microsoft.AspNetCore.Authentication.Facebook.FacebookDefaults.AuthenticationScheme,
            "github" => "GitHub", 
            _ => null
        };

        if (scheme == null) return BadRequest("Phương thức đăng nhập không hỗ trợ.");

        var properties = new AuthenticationProperties 
        { 
            RedirectUri = Url.Action(nameof(SocialCallback)) 
        };
        return Challenge(properties, scheme);
    }

    // 4. API DÙNG CHUNG XỬ LÝ DỮ LIỆU ĐỔ VỀ TỪ CÁC MXH
    [HttpGet("callback")]
    public async Task<IActionResult> SocialCallback()
    {
        var authenticateResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        if (!authenticateResult.Succeeded || authenticateResult.Principal == null)
            return BadRequest("Xác thực bên thứ ba thất bại.");

        // Đọc Email và Họ tên từ Claims
        var email = authenticateResult.Principal.FindFirst(ClaimTypes.Email)?.Value;
        var fullName = authenticateResult.Principal.FindFirst(ClaimTypes.Name)?.Value;

        // Xử lý riêng cho GitHub nếu ẩn Email công khai
        if (string.IsNullOrEmpty(email))
        {
            var githubUsername = authenticateResult.Principal.FindFirst("urn:github:login")?.Value;
            if (!string.IsNullOrEmpty(githubUsername)) email = $"{githubUsername}@github.local";
        }

        if (string.IsNullOrEmpty(email))
            return BadRequest("Không thể lấy thông tin định danh (Email) từ mạng xã hội.");

        // Tìm User trong hệ thống
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            user = new User
            {
                FullName = fullName ?? "Social User",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                Role = "Customer",
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else if (!user.IsActive)
        {
            return Unauthorized("Tài khoản hiện đang bị khóa.");
        }

        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        // Xử lý null-coalescing (?? "") để đảm bảo không lỗi Convert Null sang Non-Nullable string
        var id = user.Id;
        var role = user.Role ?? "Customer";
        var name = Uri.EscapeDataString(user.FullName ?? "Social User");

        var angularFrontendUrl = $"http://localhost:4200/login?socialLogin=true&id={id}&email={email}&fullName={name}&role={role}";
        
        return Redirect(angularFrontendUrl);
    }
}