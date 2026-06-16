using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SportTypesController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    public SportTypesController(SanTheThaoContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SportType>>> GetAll()
        => await _context.SportTypes.Where(s => s.IsActive).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<SportType>> GetById(int id)
    {
        var item = await _context.SportTypes.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<SportType>> Create(SportType item)
    {
        _context.SportTypes.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, SportType item)
    {
        if (id != item.Id) return BadRequest();
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.SportTypes.FindAsync(id);
        if (item == null) return NotFound();
        _context.SportTypes.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}