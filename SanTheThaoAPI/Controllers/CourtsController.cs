using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourtsController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    // Bổ sung IWebHostEnvironment để lấy đường dẫn lưu ảnh
    private readonly IWebHostEnvironment _env;

    public CourtsController(SanTheThaoContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

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

    // --- ĐÃ SỬA HÀM CREATE: Nhận [FromForm] và lưu ảnh ---
    [HttpPost]
    public async Task<ActionResult<Court>> Create([FromForm] CourtCreateDto input)
    {
        string? imageUrl = null;

        // Nếu có ảnh gửi lên thì tiến hành lưu vật lý
        if (input.ImageFile != null && input.ImageFile.Length > 0)
        {
            var ext = Path.GetExtension(input.ImageFile.FileName).ToLower();
            
            var webRootPath = _env.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(_env.ContentRootPath, "wwwroot");
            }
            
            var folder = Path.Combine(webRootPath, "images", "courts");
            Directory.CreateDirectory(folder); // Tạo folder wwwroot/images/courts nếu chưa có
            
            var fileName = $"court_{DateTime.Now.Ticks}{ext}";
            var path = Path.Combine(folder, fileName);
            
            using var stream = System.IO.File.Create(path);
            await input.ImageFile.CopyToAsync(stream);
            
            imageUrl = $"/images/courts/{fileName}";
        }

        // Tạo dữ liệu sân mới để lưu DB
        var court = new Court
        {
            Name = input.Name,
            SportTypeId = input.SportTypeId,
            PricePerHour = input.PricePerHour,
            Description = input.Description ?? "",
            IsActive = true,
            ImageUrl = imageUrl // Lưu đường dẫn ảnh vào DB
        };

        _context.Courts.Add(court);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = court.Id }, court);
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

// Bổ sung class DTO để nhận dữ liệu từ Angular
public class CourtCreateDto
{
    public string Name { get; set; } = string.Empty;
    public int SportTypeId { get; set; }
    public decimal PricePerHour { get; set; }
    public string? Description { get; set; }
    
    // IFormFile dùng để hứng file ảnh vật lý
    public IFormFile? ImageFile { get; set; } 
}