using System.Security.Claims;
using Microsoft.AspNetCore.Authentication; // Thư viện cấp sẵn lớp 'AuthenticationProperties' (cái Balo mang thông tin đi) và các hàm Auth
using Microsoft.AspNetCore.Authentication.Cookies; // Thư viện định nghĩa chuỗi Scheme mã hóa Cookie độc quyền của Microsoft
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
    // Yêu cầu trình duyệt chuyển hướng sang bên thứ 3 
    // và cấu hình để Middleware tự động gọi hàm SocialCallback sau khi đã hứng dữ liệu 
    // và đóng gói vào Cookie thành công
        => Challenge(new AuthenticationProperties { RedirectUri = Url.Action("SocialCallback") }, provider);



    [HttpGet("callback")] // cấu hình url
    public async Task<IActionResult> SocialCallback()
    {
        // Yêu cầu hệ thống giải mã Cookie tạm thời do Middleware vừa đóng gói để trích xuất thông tin định danh (Email, Họ tên) ra xử lý nghiệp vụ
        //sau đó lưu vào biến res (result)
        var res = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (!res.Succeeded || res.Principal == null) return BadRequest("Đăng nhập MXH thất bại.");

        // Thay vì new User(claims), ta gọi hàm private bên dưới
        var socialUser = MapClaimsToUser(res.Principal.Claims);
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

   //phương thức hỗ trợ bóc tách ra lấy email và username
   private User MapClaimsToUser(IEnumerable<Claim> claims)

    {

        var fullName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "Social User";

        var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value 

                    ?? (claims.FirstOrDefault(c => c.Type == "urn:github:login")?.Value is string git ? $"{git}@github.local" : "");

        return new User

        {

            FullName = fullName,

            Email = email

        };

    }








    // đổi pass 
    // =================================================================
    // TÍCH HỢP THÊM: 2 API QUÊN MẬT KHẨU LOCAL KHÔNG DÙNG EMAIL SERVICE
    // =================================================================

    // 1. API kiểm tra xem email có tồn tại và đang hoạt động không
    [HttpPost("check-email")]
    public async Task<IActionResult> CheckEmail([FromBody] ForgotEmailDto dto)
    {
        if (string.IsNullOrEmpty(dto.Email))
            return BadRequest("Email không được để trống"); // Trả về lỗi 400 kèm text công chuyện

        var userExists = await context.Users.AnyAsync(x => x.Email == dto.Email && x.IsActive);
        
        // Không tồn tại thì trả về false trực tiếp
        if (!userExists)
            return Ok(false); 

        // Tồn tại thì trả về true
        return Ok(true);
    }

    // 2. API cập nhật thẳng mật khẩu mới bằng BCrypt
    [HttpPost("reset-password-direct")]
    public async Task<IActionResult> ResetPasswordDirect([FromBody] ResetPasswordDirectDto dto)
    {
        if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.NewPassword))
            return BadRequest("Dữ liệu gửi lên không đầy đủ");

        var u = await context.Users.FirstOrDefaultAsync(x => x.Email == dto.Email && x.IsActive);
        if (u == null)
            return Ok(false); // Thất bại trả về false

        // Sử dụng đúng BC.HashPassword tương tự như hàm Register của bạn
        u.PasswordHash = BC.HashPassword(dto.NewPassword);

        context.Users.Update(u);
        await context.SaveChangesAsync();

        return Ok(true); // Thành công trả về true
    }






}
