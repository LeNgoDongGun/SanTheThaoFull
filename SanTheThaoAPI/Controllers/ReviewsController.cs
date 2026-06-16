using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    public ReviewsController(SanTheThaoContext context) => _context = context;

    [HttpGet("court/{courtId}")]
    public async Task<IActionResult> GetByCourtId(int courtId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.CourtId == courtId)
            .ToListAsync();
        return Ok(reviews);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Review review)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return Ok(review);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Reviews.FindAsync(id);
        if (item == null) return NotFound();
        _context.Reviews.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }
}