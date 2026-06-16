using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.DTOs;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(SanTheThaoContext context) : ControllerBase
{
    private readonly PasswordHasher<User> _hasher = new();

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var u = await context.Users.FirstOrDefaultAsync(x => x.Email == dto.Email && x.IsActive);
        if (u == null || string.IsNullOrEmpty(u.PasswordHash) || _hasher.VerifyHashedPassword(u, u.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return Unauthorized(ApiResponse<string>.Fail("Email hoặc mật khẩu không đúng"));

        return Ok(ApiResponse<AuthResponseDto>.Ok(new(u), "Đăng nhập thành công")); // <--- Ngắn gọn 1 dòng
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await context.Users.AnyAsync(x => x.Email == dto.Email)) return BadRequest(ApiResponse<string>.Fail("Email đã tồn tại"));

        var u = new User { FullName = dto.FullName ?? "", Email = dto.Email ?? "", PhoneNumber = dto.PhoneNumber ?? "", IsActive = true, CreatedAt = DateTime.Now };
        u.PasswordHash = _hasher.HashPassword(u, dto.Password ?? Guid.NewGuid().ToString());

        context.Users.Add(u);
        await context.SaveChangesAsync();
        return Ok(ApiResponse<AuthResponseDto>.Ok(new(u), "Đăng ký thành công")); // <--- Ngắn gọn 1 dòng
    }

    [HttpGet("login/{provider}")]
    public IActionResult LoginSocial(string provider) 
        => Challenge(new AuthenticationProperties { RedirectUri = Url.Action("SocialCallback") }, provider);

    
    [HttpGet("callback")]
    public async Task<IActionResult> SocialCallback()
    {
        var res = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (!res.Succeeded || res.Principal == null) return BadRequest("Đăng nhập MXH thất bại.");

        // 1. Khởi tạo user từ Claims (Toàn bộ logic bốc tách đã đẩy sang file User.cs)
        var socialUser = new User(res.Principal.Claims);
        if (string.IsNullOrEmpty(socialUser.Email)) return BadRequest("Không lấy được Email.");

        // 2. Tìm hoặc Thêm mới User vào DB bằng kỹ thuật rút gọn
        var u = await context.Users.FirstOrDefaultAsync(x => x.Email == socialUser.Email);
        if (u == null)
        {
            u = socialUser;
            u.PasswordHash = _hasher.HashPassword(u, Guid.NewGuid().ToString());
            context.Users.Add(u);
            await context.SaveChangesAsync();
        }
        else if (!u.IsActive) return Unauthorized("Tài khoản bị khóa.");

        // 3. Đăng xuất Cookie tạm và Redirect sang Angular
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        
        return Redirect($"http://localhost:4200/login?socialLogin=true&id={u.Id}&email={u.Email}&fullName={Uri.EscapeDataString(u.FullName)}&role={u.Role}");
    }
}