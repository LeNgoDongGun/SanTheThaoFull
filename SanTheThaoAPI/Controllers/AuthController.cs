using System.Security.Claims;
using BCrypt.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
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

    // 1. API ĐĂNG NHẬP TRUYỀN THỐNG (EMAIL & PASSWORD)
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(ApiResponse<string>.Fail("Email hoặc mật khẩu không đúng"));

        return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role
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
            FullName = dto.FullName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
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

    // 3. API ĐIỀU HƯỚNG SANG GOOGLE AUTH SERVER
    [HttpGet("google")]
    public IActionResult ChallengeGoogle()
    {
        // Khi Angular kích hoạt window.location.href, endpoint này sẽ đá luồng tiếp sang Google Auth
        var properties = new AuthenticationProperties 
        { 
            RedirectUri = Url.Action(nameof(GoogleCallback)) 
        };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    // 4. API TIẾP NHẬN DỮ LIỆU TỪ GOOGLE TRẢ VỀ VÀ REDIRECT VỀ ANGULAR
    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        // Đọc thông tin từ Cookie trung gian do middleware Google tạo ra
        var authenticateResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        if (!authenticateResult.Succeeded || authenticateResult.Principal == null)
            return BadRequest("Xác thực với Google thất bại.");

        // Trích xuất Email và Họ tên từ Claims của tài khoản Google
        var email = authenticateResult.Principal.FindFirst(ClaimTypes.Email)?.Value;
        var fullName = authenticateResult.Principal.FindFirst(ClaimTypes.Name)?.Value;

        if (string.IsNullOrEmpty(email))
            return BadRequest("Không thể lấy dữ liệu email từ Google.");

        // Kiểm tra xem User này đã tồn tại dưới Database của bạn chưa
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            // Nếu chưa tồn tại trong hệ thống, tự động đăng ký tài khoản mới cho khách hàng này
            user = new User
            {
                FullName = fullName ?? "Google User",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Mật khẩu ngẫu nhiên ngầm định để bảo mật
                Role = "Customer",
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else if (!user.IsActive)
        {
            return Unauthorized("Tài khoản của bạn hiện đang bị khóa.");
        }

        // Hủy bỏ session cookie tạm thời sau khi xử lý map dữ liệu xong
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        // Chuẩn bị các param để ném ngược lại cho Frontend Angular hứng qua URL
        var id = user.Id;
        var role = user.Role;
        var name = Uri.EscapeDataString(user.FullName); // Mã hóa chuỗi chống lỗi kí tự tiếng Việt/khoảng trắng trên thanh URL

        // Chuyển hướng người dùng quay trở về route login của Angular kèm thông tin User
        var angularFrontendUrl = $"http://localhost:4200/login?socialLogin=true&id={id}&email={email}&fullName={name}&role={role}";
        
        return Redirect(angularFrontendUrl);
    }
}