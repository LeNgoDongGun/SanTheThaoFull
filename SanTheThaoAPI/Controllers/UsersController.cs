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
}