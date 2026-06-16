using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    public BookingsController(SanTheThaoContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> GetAll()
        => await _context.Bookings.Include(b => b.Court).Include(b => b.User).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Booking>> GetById(int id)
    {
        var item = await _context.Bookings.Include(b => b.Court).Include(b => b.User)
                                          .FirstOrDefaultAsync(b => b.Id == id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Booking>> Create(Booking item)
    {
        // Kiểm tra trùng lịch
        var trung = await _context.Bookings.AnyAsync(b =>
            b.CourtId == item.CourtId &&
            b.BookingDate == item.BookingDate &&
            b.Status != 2 &&
            b.StartTime < item.EndTime &&
            b.EndTime > item.StartTime
        );

        if (trung)
            return BadRequest(new { message = "Sân đã được đặt trong khung giờ này!" });

        item.CreatedAt = DateTime.Now;
        item.Status = 0;
        _context.Bookings.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Booking item)
    {
        if (id != item.Id) return BadRequest();
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Bookings.FindAsync(id);
        if (item == null) return NotFound();
        _context.Bookings.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}