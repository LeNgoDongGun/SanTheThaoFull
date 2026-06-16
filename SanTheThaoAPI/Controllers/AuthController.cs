using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.DTOs;
using SanTheThaoAPI.Models;
// Khai báo sử dụng thư viện BCrypt
using BC = BCrypt.Net.BCrypt; 

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(SanTheThaoContext context) : ControllerBase
{
    // Không cần dùng PasswordHasher<User> nữa, BCrypt sử dụng các hàm static trực tiếp.

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var u = await context.Users.FirstOrDefaultAsync(x => x.Email == dto.Email && x.IsActive);
        
        // Thay thế bằng BC.Verify để kiểm tra mật khẩu
        if (u == null || string.IsNullOrEmpty(u.PasswordHash) || !BC.Verify(dto.Password, u.PasswordHash))
            return Unauthorized(ApiResponse<string>.Fail("Email hoặc mật khẩu không đúng"));

        return Ok(ApiResponse<AuthResponseDto>.Ok(new(u), "Đăng nhập thành công"));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await context.Users.AnyAsync(x => x.Email == dto.Email)) 
            return BadRequest(ApiResponse<string>.Fail("Email đã tồn tại"));

        var u = new User { FullName = dto.FullName ?? "", Email = dto.Email ?? "", PhoneNumber = dto.PhoneNumber ?? "", IsActive = true, CreatedAt = DateTime.Now };
        
        // Thay thế bằng BC.HashPassword để băm mật khẩu
        u.PasswordHash = BC.HashPassword(dto.Password ?? Guid.NewGuid().ToString());

        context.Users.Add(u);
        await context.SaveChangesAsync();
        return Ok(ApiResponse<AuthResponseDto>.Ok(new(u), "Đăng ký thành công"));
    }

    // 
    [HttpGet("login/{provider}")]
    public IActionResult LoginSocial(string provider) 
        => Challenge(new AuthenticationProperties { RedirectUri = Url.Action("SocialCallback") }, provider);

    [HttpGet("callback")]
    public async Task<IActionResult> SocialCallback()
    {
        var res = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (!res.Succeeded || res.Principal == null) return BadRequest("Đăng nhập MXH thất bại.");

        var socialUser = new User(res.Principal.Claims);
        if (string.IsNullOrEmpty(socialUser.Email)) return BadRequest("Không lấy được Email.");

        var u = await context.Users.FirstOrDefaultAsync(x => x.Email == socialUser.Email);
        if (u == null)
        {
            u = socialUser;
            // Thay thế bằng BC.HashPassword cho tài khoản social mới tạo ngẫu nhiên
            u.PasswordHash = BC.HashPassword(Guid.NewGuid().ToString());
            context.Users.Add(u);
            await context.SaveChangesAsync();
        }
        else if (!u.IsActive) return Unauthorized("Tài khoản bị khóa.");

        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        
        return Redirect($"http://localhost:4200/login?socialLogin=true&id={u.Id}&email={u.Email}&fullName={Uri.EscapeDataString(u.FullName)}&role={u.Role}");
    }
}