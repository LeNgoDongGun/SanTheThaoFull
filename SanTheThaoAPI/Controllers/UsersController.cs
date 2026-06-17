using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    public UsersController(SanTheThaoContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .Select(u => new { u.Id, u.FullName, u.Email, u.PhoneNumber, u.Role, u.IsActive, u.CreatedAt })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(new { user.Id, user.FullName, user.Email, user.PhoneNumber, user.Role, user.IsActive });
    }

    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();
        return Ok(new { user.Id, user.IsActive });
    }

    // --- THÊM MỚI BẮT ĐẦU TỪ ĐÂY ---

    // 1. Hàm cập nhật thông tin User (Sửa SĐT, Họ tên, Role)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User updatedUser)
    {
        // Kiểm tra xem id trên đường dẫn có khớp với id trong dữ liệu gửi lên không
        if (id != updatedUser.Id) return BadRequest();

        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        // Chỉ cập nhật các trường được phép thay đổi
        user.FullName = updatedUser.FullName;
        user.PhoneNumber = updatedUser.PhoneNumber;
        user.Role = updatedUser.Role;

        // Lưu ý: Thường thì Email và Password sẽ không cho đổi ở hàm này để bảo mật
        // (Trừ khi Admin muốn tự reset pass cho user)

        await _context.SaveChangesAsync();
        return Ok(user);
    }

    // 2. Hàm xoá User
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        // Chặn không cho xóa tài khoản Admin để đề phòng lỗi tự huỷ
        if (user.Role == "Admin") 
        {
            return BadRequest(new { title = "Không thể xóa tài khoản Admin." });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok();
    }
}