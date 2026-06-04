using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.DTOs;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SportTypesController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    public SportTypesController(SanTheThaoContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _context.SportTypes.Where(s => s.IsActive).ToListAsync();
        return Ok(ApiResponse<List<SportType>>.Ok(items));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _context.SportTypes.FindAsync(id);
        if (item == null)
            return NotFound(ApiResponse<string>.Fail("Không tìm thấy"));
        return Ok(ApiResponse<SportType>.Ok(item));
    }

    [HttpPost]
    public async Task<IActionResult> Create(SportType item)
    {
        _context.SportTypes.Add(item);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<SportType>.Ok(item, "Tạo thành công"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, SportType item)
    {
        if (id != item.Id)
            return BadRequest(ApiResponse<string>.Fail("ID không khớp"));
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("", "Cập nhật thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.SportTypes.FindAsync(id);
        if (item == null)
            return NotFound(ApiResponse<string>.Fail("Không tìm thấy"));
        _context.SportTypes.Remove(item);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("", "Xóa thành công"));
    }
}