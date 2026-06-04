using Microsoft.AspNetCore.Mvc;
using SanTheThaoAPI.Models;
using System.Text.Json;
using BCrypt.Net;

namespace SanTheThaoAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly SanTheThaoContext _context;

    public AuthController(SanTheThaoContext context)
    {
        _context = context;
    }

    // LOGIN
    [HttpPost("login")]
    public IActionResult Login([FromBody] JsonElement data)
    {
        var email = data.GetProperty("email").GetString();
        var password = data.GetProperty("password").GetString();

        var user = _context.Users.FirstOrDefault(u => u.Email == email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return BadRequest("Sai tài khoản hoặc mật khẩu");

        return Ok(user);
    }

    // REGISTER
    [HttpPost("register")]
    public IActionResult Register(User user)
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        user.CreatedAt = DateTime.Now;
        user.IsActive = true;

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok(user);
    }
}