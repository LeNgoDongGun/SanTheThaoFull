using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourtsController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    public CourtsController(SanTheThaoContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Court>>> GetAll()
        => await _context.Courts.Include(c => c.SportType).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Court>> GetById(int id)
    {
        var item = await _context.Courts.Include(c => c.SportType)
                                        .Include(c => c.Reviews)
                                        .FirstOrDefaultAsync(c => c.Id == id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Court>> Create(Court item)
    {
        _context.Courts.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Court item)
    {
        if (id != item.Id) return BadRequest();
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Courts.FindAsync(id);
        if (item == null) return NotFound();
        _context.Courts.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}